import { NextFunction, Request, Response } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { redis } from "../config/redis";
import { sendError } from "../utils/response";

const limiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "alyson:rate-limit",
  points: 100,
  duration: 60
});

export async function rateLimit(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.ip ?? "unknown";
    await limiter.consume(key);
    return next();
  } catch {
    return sendError(res, "Too many requests", "RATE_LIMITED", 429);
  }
}
