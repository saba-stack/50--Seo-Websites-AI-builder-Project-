import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";
import { redis } from "./config/redis";
import { startWorkers } from "./jobs/workers";

async function bootstrap() {
  const app = createApp();

  await prisma.$connect();
  await redis.ping();

  if (env.WORKER_ENABLED) {
    startWorkers();
  }

  app.listen(env.PORT, () => {
    logger.info(`Alyson AI backend started on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.error({ error }, "Failed to start server");
  process.exit(1);
});
