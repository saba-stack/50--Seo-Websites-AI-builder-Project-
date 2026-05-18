import { ArticleStatus, Prisma } from "@prisma/client";
import { articleRepository } from "../repositories/articleRepository";
import { buildSlug } from "../utils/slug";
import { AppError } from "../utils/appError";
import { aiService } from "./aiService";
import { rankingQueue } from "../config/queue";

export class ArticleService {
  async list(input: {
    cityId?: string;
    status?: ArticleStatus;
    search?: string;
    skip: number;
    limit: number;
    sortBy?: string;
    sortOrder: "asc" | "desc";
  }) {
    const sortBy = input.sortBy && ["createdAt", "publishedAt", "clicks", "ctr", "revenue"].includes(input.sortBy)
      ? input.sortBy
      : "createdAt";
    return articleRepository.list({
      cityId: input.cityId,
      status: input.status,
      search: input.search,
      skip: input.skip,
      take: input.limit,
      sortBy,
      sortOrder: input.sortOrder
    });
  }

  private async uniqueSlug(cityId: string, title: string) {
    const base = buildSlug(title);
    let slug = base;
    let suffix = 1;
    while (await this.slugExists(cityId, slug)) {
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
    return slug;
  }

  private async slugExists(cityId: string, slug: string) {
    const article = await articleRepository.findByCitySlug(cityId, slug);
    return Boolean(article);
  }

  async create(input: {
    cityId: string;
    categoryId?: string;
    authorId?: string;
    title: string;
    summary?: string;
    content: string;
    sourceUrl?: string;
    sourceName?: string;
    scheduledAt?: Date;
  }) {
    const slug = await this.uniqueSlug(input.cityId, input.title);
    return articleRepository.create({
      cityId: input.cityId,
      categoryId: input.categoryId,
      authorId: input.authorId,
      title: input.title,
      slug,
      summary: input.summary,
      content: input.content,
      sourceUrl: input.sourceUrl,
      sourceName: input.sourceName,
      scheduledAt: input.scheduledAt,
      status: ArticleStatus.DRAFT
    });
  }

  async update(id: string, data: Prisma.ArticleUncheckedUpdateInput) {
    const existing = await articleRepository.findById(id);
    if (!existing) throw new AppError("Article not found", 404, "ARTICLE_NOT_FOUND");

    const nextData: Prisma.ArticleUncheckedUpdateInput = { ...data };
    if (data.title && typeof data.title === "string" && data.title !== existing.title) {
      nextData.slug = await this.uniqueSlug(existing.cityId, data.title);
    }
    return articleRepository.update(id, nextData);
  }

  async remove(id: string) {
    await articleRepository.findById(id);
    return articleRepository.delete(id);
  }

  async publish(id: string) {
    const article = await articleRepository.findById(id);
    if (!article) throw new AppError("Article not found", 404, "ARTICLE_NOT_FOUND");
    const updated = await articleRepository.update(id, {
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date()
    });
    await rankingQueue.add("recalculate-city-ranking", { cityId: article.cityId });
    return updated;
  }

  async generateAi(id: string, input: { type: "SUMMARY" | "REWRITE" | "HEADLINE" | "SEO" | "NEWSLETTER" | "SOCIAL_CAPTION"; prompt: string }) {
    const article = await articleRepository.findById(id);
    if (!article) throw new AppError("Article not found", 404, "ARTICLE_NOT_FOUND");
    return aiService.generate({
      cityId: article.cityId,
      articleId: id,
      type: input.type,
      prompt: input.prompt
    });
  }
}

export const articleService = new ArticleService();
