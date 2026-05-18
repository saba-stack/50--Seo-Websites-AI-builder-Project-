import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export class RankingRepository {
  clearSnapshots(cityId: string) {
    return prisma.rankingSnapshot.deleteMany({ where: { cityId } });
  }

  createSnapshots(
    entries: Array<{ cityId: string; articleId: string; score: number; position: number; reason: Prisma.InputJsonValue }>
  ) {
    return prisma.rankingSnapshot.createMany({
      data: entries
    });
  }

  latestSnapshots(cityId: string) {
    return prisma.rankingSnapshot.findMany({
      where: { cityId },
      orderBy: [{ createdAt: "desc" }, { position: "asc" }],
      include: { article: true },
      take: 10
    });
  }
}

export const rankingRepository = new RankingRepository();
