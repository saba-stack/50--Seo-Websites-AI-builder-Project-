import { Prisma, ScrapeStatus, ScrapeSourceType } from "@prisma/client";
import { prisma } from "../config/prisma";

export class ScrapingRepository {
  create(data: Prisma.ScrapedContentUncheckedCreateInput) {
    return prisma.scrapedContent.create({ data });
  }

  upsertByUrl(data: {
    cityId?: string | null;
    sourceType: ScrapeSourceType;
    status: ScrapeStatus;
    title?: string;
    content?: string;
    author?: string;
    url: string;
    engagement?: number;
    metadata?: Prisma.InputJsonValue;
    publishedAt?: Date;
  }) {
    return prisma.scrapedContent.upsert({
      where: { url: data.url },
      update: {
        ...data,
        updatedAt: new Date()
      },
      create: data
    });
  }

  list(cityId?: string, sourceType?: ScrapeSourceType, skip = 0, take = 20) {
    const where: Prisma.ScrapedContentWhereInput = {
      ...(cityId ? { cityId } : {}),
      ...(sourceType ? { sourceType } : {})
    };
    return Promise.all([
      prisma.scrapedContent.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" }
      }),
      prisma.scrapedContent.count({ where })
    ]);
  }
}

export const scrapingRepository = new ScrapingRepository();
