import { Request, Response } from "express";
import { Role } from "@prisma/client";
import { authService } from "../services/authService";
import { sendSuccess } from "../utils/response";

export class AuthController {
  async register(req: Request, res: Response) {
    const user = await authService.register({
      email: req.body.email,
      password: req.body.password,
      role: req.body.role as Role,
      cityId: req.body.cityId
    });
    return sendSuccess(res, user, {}, 201);
  }

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    return sendSuccess(res, result);
  }

  async refresh(req: Request, res: Response) {
    const result = await authService.refresh(req.body.refreshToken);
    return sendSuccess(res, result);
  }

  async logout(req: Request, res: Response) {
    await authService.logout(req.user!.userId);
    return sendSuccess(res, { loggedOut: true });
  }
}

export const authController = new AuthController();
