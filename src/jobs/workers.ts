import { JobStatus, ScrapeSourceType } from "@prisma/client";
import { Job } from "bullmq";
import { createWorker, queueEvents } from "../config/queue";
import { jobRepository } from "../repositories/jobRepository";
import { aiService } from "../services/aiService";
import { scrapingService } from "../services/scrapingService";
import { rankingService } from "../services/rankingService";
import { emailService } from "../services/emailService";
import { logger } from "../config/logger";

function withJobRunUpdates<T extends { jobRunId?: string }>(
  processor: (payload: T) => Promise<unknown>
): (job: Job<T>) => Promise<unknown> {
  return async (job: Job<T>) => {
    const jobRunId = job.data.jobRunId;
    if (jobRunId) {
      await jobRepository.updateStatus(jobRunId, JobStatus.RUNNING, { attempts: job.attemptsMade + 1 });
    }

    try {
      const result = await processor(job.data);
      if (jobRunId) await jobRepository.updateStatus(jobRunId, JobStatus.COMPLETED);
      return result;
    } catch (error) {
      if (jobRunId) {
        await jobRepository.updateStatus(jobRunId, JobStatus.FAILED, {
          attempts: job.attemptsMade + 1,
          error: error instanceof Error ? error.message : "Unknown job error"
        });
      }
      throw error;
    }
  };
}

export function startWorkers() {
  type ScrapingPayload = {
    jobRunId?: string;
    cityId?: string;
    sourceType: ScrapeSourceType;
    sourceUrl: string;
    metadata?: Record<string, unknown>;
  };
  const scrapingWorker = createWorker<ScrapingPayload>(
    "scraping",
    withJobRunUpdates(async (payload) => scrapingService.run(payload))
  );

  type AiPayload = {
    jobRunId?: string;
    cityId: string;
    articleId?: string;
    type: "SUMMARY" | "REWRITE" | "HEADLINE" | "SEO" | "NEWSLETTER" | "SOCIAL_CAPTION";
    prompt: string;
  };
  const aiWorker = createWorker<AiPayload>(
    "aiGeneration",
    withJobRunUpdates(async (payload) => aiService.generate(payload))
  );

  type RankingPayload = { jobRunId?: string; cityId: string };
  const rankingWorker = createWorker<RankingPayload>(
    "ranking",
    withJobRunUpdates(async (payload) => rankingService.recalculate(payload.cityId))
  );

  type EmailPayload = { jobRunId?: string; campaignId: string };
  const emailWorker = createWorker<EmailPayload>(
    "email",
    withJobRunUpdates(async (payload) => emailService.sendCampaign(payload.campaignId))
  );

  for (const queueEvent of Object.values(queueEvents)) {
    queueEvent.on("failed", ({ jobId, failedReason }) => {
      logger.error({ jobId, failedReason }, "Queue job failed");
    });
  }

  logger.info("Workers started");
  return { scrapingWorker, aiWorker, rankingWorker, emailWorker };
}
