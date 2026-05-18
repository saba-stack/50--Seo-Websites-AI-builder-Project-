import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError";
import { logger } from "../config/logger";
import { sendError } from "../utils/response";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return sendError(res, "Validation failed", "VALIDATION_ERROR", 400);
  }

  if (err instanceof AppError) {
    return sendError(res, err.message, err.code, err.statusCode);
  }

  logger.error({ err }, "Unhandled error");
  return sendError(res, "Internal server error", "INTERNAL_ERROR", 500);
}
