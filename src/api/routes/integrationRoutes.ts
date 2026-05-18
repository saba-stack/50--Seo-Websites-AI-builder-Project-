import { Router } from "express";
import { Role } from "@prisma/client";
import { integrationController } from "../../controllers/integrationController";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { upsertIntegrationSchema } from "../../validators/integrationValidator";
import { enforceCityScope } from "../../middleware/cityScope";

const router = Router();

router.get("/", authenticate, authorize([Role.ADMIN]), asyncHandler((req, res) => integrationController.list(req, res)));
router.post(
  "/",
  authenticate,
  authorize([Role.ADMIN]),
  validate(upsertIntegrationSchema),
  enforceCityScope,
  asyncHandler((req, res) => integrationController.upsert(req, res))
);

export default router;
