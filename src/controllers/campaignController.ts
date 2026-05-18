import { Request, Response } from "express";
import { emailService } from "../services/emailService";
import { jobService } from "../services/jobService";
import { buildMeta, parsePagination } from "../utils/pagination";
import { sendSuccess } from "../utils/response";

export class CampaignController {
  async create(req: Request, res: Response) {
    const campaign = await emailService.createCampaign(req.body);
    return sendSuccess(res, campaign, {}, 201);
  }

  async list(req: Request, res: Response) {
    const { page, limit, skip, sortOrder } = parsePagination(req);
    const cityId = String(req.query.cityId);
    const [items, total] = await emailService.list(cityId, skip, limit, sortOrder);
    return sendSuccess(res, items, buildMeta(total, page, limit));
  }

  async send(req: Request, res: Response) {
    const job = await jobService.enqueueEmail({ campaignId: String(req.params.id) });
    return sendSuccess(res, { queued: true, jobId: job.id }, {}, 202);
  }
}

export const campaignController = new CampaignController();
