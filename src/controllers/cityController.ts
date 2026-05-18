import { Request, Response } from "express";
import { cityService } from "../services/cityService";
import { sendSuccess } from "../utils/response";

export class CityController {
  async create(req: Request, res: Response) {
    const city = await cityService.create(req.body);
    return sendSuccess(res, city, {}, 201);
  }

  async list(_req: Request, res: Response) {
    const cities = await cityService.list();
    return sendSuccess(res, cities);
  }

  async get(req: Request, res: Response) {
    const city = await cityService.get(String(req.params.id));
    return sendSuccess(res, city);
  }
}

export const cityController = new CityController();
