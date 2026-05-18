import { Router } from "express";
import { Role } from "@prisma/client";
import { moderationController } from "../../controllers/moderationController";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize } from "../../middleware/auth";
import { enforceCityScope } from "../../middleware/cityScope";
import { validate } from "../../middleware/validate";
import { moderationActionSchema } from "../../validators/moderationValidator";

const router = Router();

router.get(
  "/review-queue",
  authenticate,
  authorize([Role.ADMIN, Role.REVIEWER, Role.EDITOR]),
  enforceCityScope,
  asyncHandler((req, res) => moderationController.reviewQueue(req, res))
);

router.post(
  "/articles/:id/action",
  authenticate,
  authorize([Role.ADMIN, Role.REVIEWER]),
  validate(moderationActionSchema),
  asyncHandler((req, res) => moderationController.action(req, res))
);

export default router;
