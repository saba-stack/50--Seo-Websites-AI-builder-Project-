import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { sendError } from "../utils/response";

function extractCityId(req: Request): string | undefined {
  return String(req.params.cityId ?? req.query.cityId ?? req.body.cityId ?? "");
}

export function enforceCityScope(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return sendError(res, "Unauthorized", "UNAUTHORIZED", 401);

  if (req.user.role === Role.ADMIN) return next();

  const requestedCityId = extractCityId(req);
  if (!requestedCityId) {
    return sendError(res, "cityId is required", "CITY_REQUIRED", 400);
  }

  if (!req.user.cityId || req.user.cityId !== requestedCityId) {
    return sendError(res, "City access denied", "CITY_FORBIDDEN", 403);
  }

  return next();
}
