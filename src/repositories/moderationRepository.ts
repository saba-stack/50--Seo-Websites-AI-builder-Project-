import { ModerationActionType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export class ModerationRepository {
  createAction(data: Prisma.ModerationActionUncheckedCreateInput) {
    return prisma.moderationAction.create({ data });
  }

  reviewQueue(cityId: string, skip: number, take: number) {
    const where: Prisma.ArticleWhereInput = {
      cityId,
      status: { in: ["DRAFT", "REVIEW_PENDING"] }
    };
    return Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take,
        include: {
          moderationActions: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { user: { select: { email: true, role: true } } }
          }
        },
        orderBy: { updatedAt: "desc" }
      }),
      prisma.article.count({ where })
    ]);
  }
}

export const moderationRepository = new ModerationRepository();
