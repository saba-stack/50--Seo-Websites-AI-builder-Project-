import { Router } from "express";
import { Role } from "@prisma/client";
import { campaignController } from "../../controllers/campaignController";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createCampaignSchema } from "../../validators/campaignValidator";
import { enforceCityScope } from "../../middleware/cityScope";

const router = Router();

router.get("/", authenticate, enforceCityScope, asyncHandler((req, res) => campaignController.list(req, res)));
router.post(
  "/",
  authenticate,
  authorize([Role.ADMIN, Role.EDITOR]),
  validate(createCampaignSchema),
  enforceCityScope,
  asyncHandler((req, res) => campaignController.create(req, res))
);
router.post("/:id/send", authenticate, authorize([Role.ADMIN, Role.EDITOR]), asyncHandler((req, res) => campaignController.send(req, res)));

export default router;
