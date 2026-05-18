import { Processor, Queue, QueueEvents, Worker, JobsOptions } from "bullmq";
import { redis } from "./redis";

export const queueNames = {
  scraping: "scraping",
  aiGeneration: "aiGeneration",
  ranking: "ranking",
  email: "email"
} as const;

const defaultJobOptions: JobsOptions = {
  removeOnComplete: { age: 86400, count: 1000 },
  removeOnFail: { age: 172800, count: 1000 },
  attempts: 4,
  backoff: {
    type: "exponential",
    delay: 1500
  }
};

export const scrapingQueue = new Queue(queueNames.scraping, {
  connection: redis,
  defaultJobOptions
});

export const aiGenerationQueue = new Queue(queueNames.aiGeneration, {
  connection: redis,
  defaultJobOptions
});

export const rankingQueue = new Queue(queueNames.ranking, {
  connection: redis,
  defaultJobOptions
});

export const emailQueue = new Queue(queueNames.email, {
  connection: redis,
  defaultJobOptions
});

export const queueEvents = {
  scraping: new QueueEvents(queueNames.scraping, { connection: redis }),
  aiGeneration: new QueueEvents(queueNames.aiGeneration, { connection: redis }),
  ranking: new QueueEvents(queueNames.ranking, { connection: redis }),
  email: new QueueEvents(queueNames.email, { connection: redis })
};

export function createWorker<DataType = unknown, ResultType = unknown>(
  name: keyof typeof queueNames,
  processor: Processor<DataType, ResultType>
) {
  return new Worker<DataType>(queueNames[name], processor, { connection: redis, concurrency: 5 });
}
