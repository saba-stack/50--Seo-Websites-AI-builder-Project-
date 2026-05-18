import { Router } from "express";
import { Role } from "@prisma/client";
import { rankingController } from "../../controllers/rankingController";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize } from "../../middleware/auth";
import { enforceCityScope } from "../../middleware/cityScope";

const router = Router();

router.get("/:cityId/top", authenticate, enforceCityScope, asyncHandler((req, res) => rankingController.top(req, res)));
router.post(
  "/:cityId/recalculate",
  authenticate,
  authorize([Role.ADMIN, Role.EDITOR]),
  enforceCityScope,
  asyncHandler((req, res) => rankingController.recalculate(req, res))
);
router.post(
  "/:cityId/recalculate/queue",
  authenticate,
  authorize([Role.ADMIN, Role.EDITOR]),
  enforceCityScope,
  asyncHandler((req, res) => rankingController.queueRecalculate(req, res))
);

export default router;
