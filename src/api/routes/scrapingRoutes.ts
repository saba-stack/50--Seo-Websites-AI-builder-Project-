import { Router } from "express";
import { Role } from "@prisma/client";
import { scrapingController } from "../../controllers/scrapingController";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { runScrapingSchema } from "../../validators/scrapingValidator";
import { enforceCityScope } from "../../middleware/cityScope";

const router = Router();

router.get("/", authenticate, enforceCityScope, asyncHandler((req, res) => scrapingController.list(req, res)));
router.post(
  "/run",
  authenticate,
  authorize([Role.ADMIN, Role.EDITOR]),
  validate(runScrapingSchema),
  enforceCityScope,
  asyncHandler((req, res) => scrapingController.run(req, res))
);
router.post(
  "/queue",
  authenticate,
  authorize([Role.ADMIN, Role.EDITOR]),
  validate(runScrapingSchema),
  enforceCityScope,
  asyncHandler((req, res) => scrapingController.queue(req, res))
);

export default router;
