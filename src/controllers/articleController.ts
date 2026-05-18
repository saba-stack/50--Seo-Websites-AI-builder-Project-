import { Request, Response } from "express";
import { ArticleStatus } from "@prisma/client";
import { articleService } from "../services/articleService";
import { buildMeta, parsePagination } from "../utils/pagination";
import { sendSuccess } from "../utils/response";

export class ArticleController {
  async list(req: Request, res: Response) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(req);
    const { items, total } = await articleService.list({
      cityId: req.query.cityId ? String(req.query.cityId) : undefined,
      status: req.query.status ? (String(req.query.status) as ArticleStatus) : undefined,
      search: req.query.search ? String(req.query.search) : undefined,
      skip,
      limit,
      sortBy,
      sortOrder
    });
    return sendSuccess(res, items, buildMeta(total, page, limit));
  }

  async create(req: Request, res: Response) {
    const article = await articleService.create({
      ...req.body,
      authorId: req.user?.userId
    });
    return sendSuccess(res, article, {}, 201);
  }

  async update(req: Request, res: Response) {
    const article = await articleService.update(String(req.params.id), req.body);
    return sendSuccess(res, article);
  }

  async remove(req: Request, res: Response) {
    await articleService.remove(String(req.params.id));
    return sendSuccess(res, { deleted: true });
  }

  async publish(req: Request, res: Response) {
    const article = await articleService.publish(String(req.params.id));
    return sendSuccess(res, article);
  }

  async generate(req: Request, res: Response) {
    const result = await articleService.generateAi(String(req.params.id), req.body);
    return sendSuccess(res, result);
  }
}

export const articleController = new ArticleController();
