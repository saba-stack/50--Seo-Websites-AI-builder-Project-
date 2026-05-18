import { Request, Response } from "express";
import { rankingService } from "../services/rankingService";
import { jobService } from "../services/jobService";
import { sendSuccess } from "../utils/response";

export class RankingController {
  async top(req: Request, res: Response) {
    const cityId = req.params.cityId || String(req.query.cityId);
    const rankings = await rankingService.top(String(cityId));
    return sendSuccess(res, rankings);
  }

  async recalculate(req: Request, res: Response) {
    const cityId = req.params.cityId || req.body.cityId;
    const result = await rankingService.recalculate(String(cityId));
    return sendSuccess(res, result);
  }

  async queueRecalculate(req: Request, res: Response) {
    const cityId = req.params.cityId || req.body.cityId;
    const job = await jobService.enqueueRanking({ cityId: String(cityId) });
    return sendSuccess(res, { jobId: job.id }, {}, 202);
  }
}

export const rankingController = new RankingController();
