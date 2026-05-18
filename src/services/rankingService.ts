import dayjs from "dayjs";
import { articleRepository } from "../repositories/articleRepository";
import { rankingRepository } from "../repositories/rankingRepository";
import { redis } from "../config/redis";

const RANKING_CACHE_PREFIX = "alyson:rankings";

export class RankingService {
  private scoreArticle(article: {
    ctr: number;
    clicks: number;
    engagement: number;
    revenue: number;
    createdAt: Date;
    manualRankOverride: number | null;
  }) {
    if (article.manualRankOverride !== null) {
      return 1_000_000 - article.manualRankOverride;
    }

    const ageHours = Math.max(1, dayjs().diff(article.createdAt, "hour"));
    const freshnessDecay = Math.exp(-ageHours / 72);
    const score =
      article.ctr * 0.35 +
      Math.log10(article.clicks + 1) * 0.2 +
      article.engagement * 0.2 +
      article.revenue * 0.15 +
      freshnessDecay * 0.1;
    return Number(score.toFixed(6));
  }

  async recalculate(cityId: string) {
    const articles = await articleRepository.publishedByCity(cityId);
    const scored = articles
      .map((article) => ({
        articleId: article.id,
        score: this.scoreArticle(article),
        reason: {
          ctr: article.ctr,
          clicks: article.clicks,
          engagement: article.engagement,
          revenue: article.revenue,
          createdAt: article.createdAt
        }
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    await rankingRepository.clearSnapshots(cityId);
    await rankingRepository.createSnapshots(
      scored.map((item, index) => ({
        cityId,
        articleId: item.articleId,
        score: item.score,
        position: index + 1,
        reason: item.reason
      }))
    );

    await redis.set(`${RANKING_CACHE_PREFIX}:${cityId}`, JSON.stringify(scored), "EX", 300);
    return scored;
  }

  async top(cityId: string) {
    const cached = await redis.get(`${RANKING_CACHE_PREFIX}:${cityId}`);
    if (cached) return JSON.parse(cached) as unknown[];

    const snapshots = await rankingRepository.latestSnapshots(cityId);
    return snapshots.map((snapshot) => ({
      articleId: snapshot.articleId,
      position: snapshot.position,
      score: snapshot.score,
      article: snapshot.article
    }));
  }
}

export const rankingService = new RankingService();
