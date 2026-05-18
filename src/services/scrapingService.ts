import axios from "axios";
import * as cheerio from "cheerio";
import Parser from "rss-parser";
import puppeteer from "puppeteer-core";
import { Prisma, ScrapeSourceType, ScrapeStatus } from "@prisma/client";
import { scrapingRepository } from "../repositories/scrapingRepository";

const rssParser = new Parser();

export class ScrapingService {
  private async scrapeRss(cityId: string | undefined, sourceUrl: string) {
    const feed = await rssParser.parseURL(sourceUrl);
    const writes = feed.items.map((item) =>
      scrapingRepository.upsertByUrl({
        cityId,
        sourceType: ScrapeSourceType.RSS,
        status: ScrapeStatus.COMPLETED,
        title: item.title ?? "",
        content: item.contentSnippet ?? item.content ?? "",
        author: item.creator ?? item.author ?? "",
        url: item.link ?? `${sourceUrl}#${item.guid ?? item.title}`,
        metadata: {
          categories: item.categories ?? [],
          isoDate: item.isoDate
        } as Prisma.InputJsonValue,
        publishedAt: item.isoDate ? new Date(item.isoDate) : undefined
      })
    );
    return Promise.all(writes);
  }

  private async scrapeReddit(cityId: string | undefined, sourceUrl: string) {
    const url = sourceUrl.endsWith(".json") ? sourceUrl : `${sourceUrl.replace(/\/$/, "")}.json`;
    const response = await axios.get(url);
    const posts = response.data?.data?.children ?? [];
    return Promise.all(
      posts.map((post: { data: Record<string, unknown> }) =>
        scrapingRepository.upsertByUrl({
          cityId,
          sourceType: ScrapeSourceType.REDDIT,
          status: ScrapeStatus.COMPLETED,
          title: String(post.data.title ?? ""),
          content: String(post.data.selftext ?? ""),
          author: String(post.data.author ?? ""),
          url: `https://reddit.com${String(post.data.permalink ?? "")}`,
          engagement: Number(post.data.score ?? 0),
          metadata: {
            numComments: Number(post.data.num_comments ?? 0),
            subreddit: String(post.data.subreddit ?? "")
          } as Prisma.InputJsonValue,
          publishedAt: post.data.created_utc ? new Date(Number(post.data.created_utc) * 1000) : undefined
        })
      )
    );
  }

  private async scrapeNewsPage(
    cityId: string | undefined,
    sourceType: ScrapeSourceType,
    sourceUrl: string,
    dynamic = false
  ) {
    let html = "";
    if (dynamic) {
      const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      if (!executablePath) {
        throw new Error("PUPPETEER_EXECUTABLE_PATH is required for dynamic scraping with puppeteer-core");
      }
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
        executablePath
      });
      const page = await browser.newPage();
      await page.goto(sourceUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
      html = await page.content();
      await browser.close();
    } else {
      const response = await axios.get(sourceUrl);
      html = response.data;
    }

    const $ = cheerio.load(html);
    const title = $("title").first().text().trim();
    const articleText = $("article").text().trim() || $("body").text().replace(/\s+/g, " ").trim();

    return scrapingRepository.upsertByUrl({
      cityId,
      sourceType,
      status: ScrapeStatus.COMPLETED,
      title,
      content: articleText.slice(0, 15000),
      url: sourceUrl,
      metadata: {
        scrapedAt: new Date().toISOString(),
        sourceDomain: new URL(sourceUrl).hostname
      } as Prisma.InputJsonValue
    });
  }

  async run(input: { cityId?: string; sourceType: ScrapeSourceType; sourceUrl: string; metadata?: Record<string, unknown> }) {
    await scrapingRepository.upsertByUrl({
      cityId: input.cityId,
      sourceType: input.sourceType,
      status: ScrapeStatus.RUNNING,
      url: input.sourceUrl,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue
    });

    switch (input.sourceType) {
      case ScrapeSourceType.RSS:
        return this.scrapeRss(input.cityId, input.sourceUrl);
      case ScrapeSourceType.REDDIT:
        return this.scrapeReddit(input.cityId, input.sourceUrl);
      case ScrapeSourceType.BBC:
      case ScrapeSourceType.REUTERS:
      case ScrapeSourceType.WEB:
        return this.scrapeNewsPage(input.cityId, input.sourceType, input.sourceUrl);
      case ScrapeSourceType.TIKTOK:
      case ScrapeSourceType.INSTAGRAM:
      case ScrapeSourceType.FACEBOOK:
        return scrapingRepository.upsertByUrl({
          cityId: input.cityId,
          sourceType: input.sourceType,
          status: ScrapeStatus.COMPLETED,
          title: `${input.sourceType} placeholder`,
          content: "Social API placeholder content captured for future API integrations.",
          url: input.sourceUrl,
          metadata: { ...(input.metadata ?? {}), placeholder: true } as Prisma.InputJsonValue
        });
      default:
        return null;
    }
  }

  list(input: { cityId?: string; sourceType?: ScrapeSourceType; skip: number; limit: number }) {
    return scrapingRepository.list(input.cityId, input.sourceType, input.skip, input.limit);
  }
}

export const scrapingService = new ScrapingService();
