import { Router } from "express";
import { Role } from "@prisma/client";
import { analyticsController } from "../../controllers/analyticsController";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { trackEventSchema } from "../../validators/analyticsValidator";
import { enforceCityScope } from "../../middleware/cityScope";

const router = Router();

router.post(
  "/events",
  authenticate,
  authorize([Role.ADMIN, Role.EDITOR, Role.REVIEWER]),
  validate(trackEventSchema),
  enforceCityScope,
  asyncHandler((req, res) => analyticsController.track(req, res))
);
router.get("/dashboard", authenticate, enforceCityScope, asyncHandler((req, res) => analyticsController.dashboard(req, res)));

export default router;
