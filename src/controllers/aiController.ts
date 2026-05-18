import { Request, Response } from "express";
import { aiService } from "../services/aiService";
import { sendSuccess } from "../utils/response";
import { jobService } from "../services/jobService";

export class AiController {
  async generate(req: Request, res: Response) {
    const result = await aiService.generate({
      cityId: req.body.cityId,
      articleId: req.body.articleId,
      type: req.body.type,
      prompt: req.body.prompt,
      preferredProvider: req.body.preferredProvider
    });
    return sendSuccess(res, result);
  }

  async queue(req: Request, res: Response) {
    const job = await jobService.enqueueAi(req.body);
    return sendSuccess(res, { jobId: job.id }, {}, 202);
  }
}

export const aiController = new AiController();
