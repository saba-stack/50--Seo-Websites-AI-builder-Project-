import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";
import { redis } from "./config/redis";
import { startWorkers } from "./jobs/workers";

const REDIS_BOOT_TIMEOUT_MS = 5000;

async function isRedisAvailable() {
  try {
    const pingResult = await Promise.race([
      redis.ping(),
      new Promise<"timeout">((resolve) => {
        setTimeout(() => resolve("timeout"), REDIS_BOOT_TIMEOUT_MS);
      })
    ]);

    return pingResult === "PONG";
  } catch (error) {
    logger.warn(
      {
        error: error instanceof Error ? error.message : "Unknown redis error"
      },
      "Redis unavailable during startup"
    );
    return false;
  }
}

async function bootstrap() {
  const app = createApp();

  await prisma.$connect();

  redis.on("error", (error) => {
    logger.warn(
      { error: error.message },
      "Redis client error. Continuing without startup dependency on Redis."
    );
  });

  const redisAvailable = await isRedisAvailable();

  if (env.WORKER_ENABLED && redisAvailable) {
    startWorkers();
  } else if (env.WORKER_ENABLED && !redisAvailable) {
    logger.warn("Workers disabled at boot because Redis is not reachable");
  }

  app.listen(env.PORT, () => {
    logger.info(`Alyson AI backend started on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.error({ error }, "Failed to start server");
  process.exit(1);
});
