import { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sortBy?: string;
  sortOrder: "asc" | "desc";
}

export function parsePagination(req: Request): PaginationParams {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
  const skip = (page - 1) * limit;
  const sortBy = req.query.sortBy ? String(req.query.sortBy) : undefined;
  const sortOrder = String(req.query.sortOrder ?? "desc").toLowerCase() === "asc" ? "asc" : "desc";

  return { page, limit, skip, sortBy, sortOrder };
}

export function buildMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}
