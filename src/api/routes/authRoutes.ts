import { Router } from "express";
import { authController } from "../../controllers/authController";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validate } from "../../middleware/validate";
import { loginSchema, refreshSchema, registerSchema } from "../../validators/authValidator";
import { authenticate, authorize } from "../../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

router.post("/register", authenticate, authorize([Role.ADMIN]), validate(registerSchema), asyncHandler((req, res) => authController.register(req, res)));
router.post("/login", validate(loginSchema), asyncHandler((req, res) => authController.login(req, res)));
router.post("/refresh", validate(refreshSchema), asyncHandler((req, res) => authController.refresh(req, res)));
router.post("/logout", authenticate, asyncHandler((req, res) => authController.logout(req, res)));

export default router;
