import { Request, Response } from "express";
import { SettingScope } from "@prisma/client";
import { settingService } from "../services/settingService";
import { sendSuccess } from "../utils/response";

export class SettingController {
  async upsert(req: Request, res: Response) {
    const setting = await settingService.upsert({
      cityId: req.body.cityId,
      scope: req.body.scope as SettingScope,
      key: req.body.key,
      value: req.body.value
    });
    return sendSuccess(res, setting);
  }

  async list(req: Request, res: Response) {
    const cityId = req.query.cityId ? String(req.query.cityId) : undefined;
    const settings = await settingService.list(cityId);
    return sendSuccess(res, settings);
  }
}

export const settingController = new SettingController();
