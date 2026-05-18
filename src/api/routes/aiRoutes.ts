import { Router } from "express";
import { Role } from "@prisma/client";
import { aiController } from "../../controllers/aiController";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { aiGenerateSchema } from "../../validators/aiValidator";
import { enforceCityScope } from "../../middleware/cityScope";

const router = Router();

router.post(
  "/generate",
  authenticate,
  authorize([Role.ADMIN, Role.EDITOR]),
  validate(aiGenerateSchema),
  enforceCityScope,
  asyncHandler((req, res) => aiController.generate(req, res))
);

router.post(
  "/generate/queue",
  authenticate,
  authorize([Role.ADMIN, Role.EDITOR]),
  validate(aiGenerateSchema),
  enforceCityScope,
  asyncHandler((req, res) => aiController.queue(req, res))
);

export default router;
