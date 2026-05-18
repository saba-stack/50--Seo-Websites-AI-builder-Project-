import { Request, Response } from "express";
import { EventType } from "@prisma/client";
import { analyticsService } from "../services/analyticsService";
import { sendSuccess } from "../utils/response";

export class AnalyticsController {
  async track(req: Request, res: Response) {
    const event = await analyticsService.trackEvent({
      cityId: req.body.cityId,
      articleId: req.body.articleId,
      subscriberId: req.body.subscriberId,
      eventType: req.body.eventType as EventType,
      source: req.body.source,
      value: req.body.value,
      metadata: req.body.metadata
    });
    return sendSuccess(res, event, {}, 201);
  }

  async dashboard(req: Request, res: Response) {
    const cityId = String(req.query.cityId);
    const days = req.query.days ? Number(req.query.days) : 30;
    const data = await analyticsService.dashboard(cityId, days);
    return sendSuccess(res, data);
  }
}

export const analyticsController = new AnalyticsController();
