import { Request, Response } from "express";
import { subscriberService } from "../services/subscriberService";
import { buildMeta, parsePagination } from "../utils/pagination";
import { sendSuccess } from "../utils/response";

export class SubscriberController {
  async create(req: Request, res: Response) {
    const subscriber = await subscriberService.create(req.body);
    return sendSuccess(res, subscriber, {}, 201);
  }

  async list(req: Request, res: Response) {
    const { page, limit, skip, sortOrder } = parsePagination(req);
    const cityId = String(req.query.cityId);
    const [items, total] = await subscriberService.list({ cityId, skip, limit, sortOrder });
    return sendSuccess(res, items, buildMeta(total, page, limit));
  }

  async unsubscribe(req: Request, res: Response) {
    await subscriberService.unsubscribe(String(req.params.id));
    return sendSuccess(res, { unsubscribed: true });
  }
}

export const subscriberController = new SubscriberController();
