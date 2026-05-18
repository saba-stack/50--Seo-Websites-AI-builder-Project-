import { Request, Response } from "express";
import { IntegrationProvider } from "@prisma/client";
import { integrationService } from "../services/integrationService";
import { sendSuccess } from "../utils/response";

export class IntegrationController {
  async list(req: Request, res: Response) {
    const cityId = req.query.cityId ? String(req.query.cityId) : undefined;
    const integrations = await integrationService.list(cityId);
    return sendSuccess(res, integrations);
  }

  async upsert(req: Request, res: Response) {
    const integration = await integrationService.upsert({
      cityId: req.body.cityId,
      provider: req.body.provider as IntegrationProvider,
      apiKey: req.body.apiKey,
      isEnabled: req.body.isEnabled,
      config: req.body.config
    });
    return sendSuccess(res, integration);
  }
}

export const integrationController = new IntegrationController();
