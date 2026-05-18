import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { verifyAccessToken } from "../utils/jwt";
import { sendError } from "../utils/response";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return sendError(res, "Missing access token", "UNAUTHORIZED", 401);
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      role: payload.role as Role,
      cityId: payload.cityId
    };
    return next();
  } catch {
    return sendError(res, "Invalid or expired token", "UNAUTHORIZED", 401);
  }
}

export function authorize(roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return sendError(res, "Unauthorized", "UNAUTHORIZED", 401);
    if (!roles.includes(req.user.role)) return sendError(res, "Forbidden", "FORBIDDEN", 403);
    return next();
  };
}
