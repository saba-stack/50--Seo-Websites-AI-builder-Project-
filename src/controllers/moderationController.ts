import { Request, Response } from "express";
import { ModerationActionType } from "@prisma/client";
import { moderationService } from "../services/moderationService";
import { buildMeta, parsePagination } from "../utils/pagination";
import { sendSuccess } from "../utils/response";

export class ModerationController {
  async reviewQueue(req: Request, res: Response) {
    const { page, limit, skip } = parsePagination(req);
    const cityId = String(req.query.cityId);
    const [items, total] = await moderationService.reviewQueue(cityId, skip, limit);
    return sendSuccess(res, items, buildMeta(total, page, limit));
  }

  async action(req: Request, res: Response) {
    const action = await moderationService.applyAction({
      articleId: String(req.params.id),
      userId: req.user!.userId,
      action: req.body.action as ModerationActionType,
      notes: req.body.notes,
      content: req.body.content
    });
    return sendSuccess(res, action);
  }
}

export const moderationController = new ModerationController();
