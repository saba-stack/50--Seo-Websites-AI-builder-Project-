import { EventType, Prisma } from "@prisma/client";
import { analyticsRepository } from "../repositories/analyticsRepository";
import { prisma } from "../config/prisma";

export class AnalyticsService {
  async trackEvent(input: {
    cityId: string;
    articleId?: string;
    subscriberId?: string;
    eventType: EventType;
    source?: string;
    value?: number;
    metadata?: Record<string, unknown>;
  }) {
    const event = await analyticsRepository.createEvent({
      cityId: input.cityId,
      articleId: input.articleId,
      subscriberId: input.subscriberId,
      eventType: input.eventType,
      source: input.source,
      value: input.value ?? 1,
      metadata: input.metadata as Prisma.InputJsonValue | undefined
    });

    if (input.articleId) {
      await this.updateArticleMetrics(input.articleId);
    }
    return event;
  }

  private async updateArticleMetrics(articleId: string) {
    const [views, clicks, engagementValue, revenueValue] = await Promise.all([
      prisma.analyticsEvent.count({ where: { articleId, eventType: EventType.VIEW } }),
      prisma.analyticsEvent.count({ where: { articleId, eventType: EventType.CLICK } }),
      prisma.analyticsEvent.aggregate({ where: { articleId, eventType: EventType.ENGAGEMENT }, _sum: { value: true } }),
      prisma.analyticsEvent.aggregate({ where: { articleId, eventType: EventType.REVENUE }, _sum: { value: true } })
    ]);

    const ctr = views > 0 ? clicks / views : 0;
    await prisma.article.update({
      where: { id: articleId },
      data: {
        views,
        clicks,
        engagement: engagementValue._sum.value ?? 0,
        revenue: revenueValue._sum.value ?? 0,
        ctr
      }
    });
  }

  async dashboard(cityId: string, days = 30) {
    const to = new Date();
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const [views, clicks, revenueAggregate, activeSubscribers, campaigns] = await analyticsRepository.dashboard(cityId, from, to);
    const trafficSources = await analyticsRepository.trafficSources(cityId, from, to);

    const avgOpenRate =
      campaigns.length > 0 ? campaigns.reduce((sum, campaign) => sum + campaign.openRate, 0) / campaigns.length : 0;
    const avgClickRate =
      campaigns.length > 0 ? campaigns.reduce((sum, campaign) => sum + campaign.clickRate, 0) / campaigns.length : 0;

    return {
      views,
      clicks,
      ctr: views > 0 ? clicks / views : 0,
      revenue: revenueAggregate._sum.value ?? 0,
      activeSubscribers,
      emailPerformance: {
        openRate: avgOpenRate,
        clickRate: avgClickRate
      },
      trafficSources
    };
  }
}

export const analyticsService = new AnalyticsService();
