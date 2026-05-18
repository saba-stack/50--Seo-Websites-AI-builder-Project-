import { Request, Response } from "express";
import { ScrapeSourceType } from "@prisma/client";
import { scrapingService } from "../services/scrapingService";
import { jobService } from "../services/jobService";
import { buildMeta, parsePagination } from "../utils/pagination";
import { sendSuccess } from "../utils/response";

export class ScrapingController {
  async queue(req: Request, res: Response) {
    const job = await jobService.enqueueScraping(req.body);
    return sendSuccess(res, { jobId: job.id }, {}, 202);
  }

  async run(req: Request, res: Response) {
    const result = await scrapingService.run({
      cityId: req.body.cityId,
      sourceType: req.body.sourceType as ScrapeSourceType,
      sourceUrl: req.body.sourceUrl,
      metadata: req.body.metadata
    });
    return sendSuccess(res, result);
  }

  async list(req: Request, res: Response) {
    const { page, limit, skip } = parsePagination(req);
    const cityId = req.query.cityId ? String(req.query.cityId) : undefined;
    const sourceType = req.query.sourceType ? (String(req.query.sourceType) as ScrapeSourceType) : undefined;
    const [items, total] = await scrapingService.list({ cityId, sourceType, skip, limit });
    return sendSuccess(res, items, buildMeta(total, page, limit));
  }
}

export const scrapingController = new ScrapingController();
