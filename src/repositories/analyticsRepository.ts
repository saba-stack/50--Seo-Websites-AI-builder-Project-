import { EventType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export class AnalyticsRepository {
  createEvent(data: Prisma.AnalyticsEventUncheckedCreateInput) {
    return prisma.analyticsEvent.create({ data });
  }

  dashboard(cityId: string, from: Date, to: Date) {
    return Promise.all([
      prisma.analyticsEvent.count({ where: { cityId, eventType: EventType.VIEW, createdAt: { gte: from, lte: to } } }),
      prisma.analyticsEvent.count({ where: { cityId, eventType: EventType.CLICK, createdAt: { gte: from, lte: to } } }),
      prisma.analyticsEvent.aggregate({
        where: { cityId, eventType: EventType.REVENUE, createdAt: { gte: from, lte: to } },
        _sum: { value: true }
      }),
      prisma.subscriber.count({ where: { cityId, isActive: true } }),
      prisma.emailCampaign.findMany({
        where: { cityId },
        select: { id: true, openRate: true, clickRate: true },
        orderBy: { createdAt: "desc" },
        take: 20
      })
    ]);
  }

  trafficSources(cityId: string, from: Date, to: Date) {
    return prisma.analyticsEvent.groupBy({
      by: ["source"],
      where: { cityId, createdAt: { gte: from, lte: to }, source: { not: null } },
      _count: { source: true }
    });
  }
}

export const analyticsRepository = new AnalyticsRepository();
