import { Router } from "express";
import { Role } from "@prisma/client";
import { settingController } from "../../controllers/settingController";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { upsertSettingSchema } from "../../validators/settingsValidator";
import { enforceCityScope } from "../../middleware/cityScope";

const router = Router();

router.get("/", authenticate, enforceCityScope, asyncHandler((req, res) => settingController.list(req, res)));
router.post(
  "/",
  authenticate,
  authorize([Role.ADMIN]),
  validate(upsertSettingSchema),
  enforceCityScope,
  asyncHandler((req, res) => settingController.upsert(req, res))
);

export default router;
