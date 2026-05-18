import { Response } from "express";

type Meta = Record<string, unknown>;

export function sendSuccess(res: Response, data: unknown, meta: Meta = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    meta
  });
}

export function sendError(res: Response, error: string, code: string, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error,
    code
  });
}
