import { JobType, Prisma } from "@prisma/client";
import { aiGenerationQueue, emailQueue, rankingQueue, scrapingQueue } from "../config/queue";
import { jobRepository } from "../repositories/jobRepository";

export class JobService {
  async enqueueScraping(payload: { cityId?: string; sourceType: string; sourceUrl: string; metadata?: Record<string, unknown> }) {
    const record = await jobRepository.create(JobType.SCRAPING, payload as unknown as Prisma.InputJsonValue);
    await scrapingQueue.add("scrape-source", { ...payload, jobRunId: record.id });
    return record;
  }

  async enqueueAi(payload: {
    cityId: string;
    articleId?: string;
    type: "SUMMARY" | "REWRITE" | "HEADLINE" | "SEO" | "NEWSLETTER" | "SOCIAL_CAPTION";
    prompt: string;
  }) {
    const record = await jobRepository.create(JobType.AI_GENERATION, payload as unknown as Prisma.InputJsonValue);
    await aiGenerationQueue.add("generate-ai", { ...payload, jobRunId: record.id });
    return record;
  }

  async enqueueRanking(payload: { cityId: string }) {
    const record = await jobRepository.create(JobType.RANKING, payload as unknown as Prisma.InputJsonValue);
    await rankingQueue.add("recalculate-city-ranking", { ...payload, jobRunId: record.id });
    return record;
  }

  async enqueueEmail(payload: { campaignId: string }) {
    const record = await jobRepository.create(JobType.EMAIL_SENDING, payload as unknown as Prisma.InputJsonValue);
    await emailQueue.add("send-campaign", { ...payload, jobRunId: record.id });
    return record;
  }
}

export const jobService = new JobService();
