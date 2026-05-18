import { Prisma, ArticleStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

interface ListInput {
  cityId?: string;
  status?: ArticleStatus;
  search?: string;
  skip: number;
  take: number;
  sortBy: string;
  sortOrder: Prisma.SortOrder;
}

export class ArticleRepository {
  async list(input: ListInput) {
    const where: Prisma.ArticleWhereInput = {
      cityId: input.cityId,
      status: input.status,
      ...(input.search
        ? {
            OR: [
              { title: { contains: input.search, mode: "insensitive" } },
              { content: { contains: input.search, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip: input.skip,
        take: input.take,
        orderBy: { [input.sortBy]: input.sortOrder },
        include: { category: true, city: true }
      }),
      prisma.article.count({ where })
    ]);

    return { items, total };
  }

  create(data: Prisma.ArticleUncheckedCreateInput) {
    return prisma.article.create({ data });
  }

  update(id: string, data: Prisma.ArticleUncheckedUpdateInput) {
    return prisma.article.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.article.delete({ where: { id } });
  }

  findById(id: string) {
    return prisma.article.findUnique({ where: { id } });
  }

  findByCitySlug(cityId: string, slug: string) {
    return prisma.article.findUnique({
      where: {
        cityId_slug: { cityId, slug }
      }
    });
  }

  topCityArticles(cityId: string, take: number) {
    return prisma.article.findMany({
      where: { cityId, status: "PUBLISHED" },
      take,
      orderBy: [{ manualRankOverride: "asc" }, { ctr: "desc" }, { clicks: "desc" }]
    });
  }

  publishedByCity(cityId: string) {
    return prisma.article.findMany({
      where: { cityId, status: "PUBLISHED" }
    });
  }
}

export const articleRepository = new ArticleRepository();
