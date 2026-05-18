import { Router } from "express";
import { Role } from "@prisma/client";
import { subscriberController } from "../../controllers/subscriberController";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createSubscriberSchema } from "../../validators/subscriberValidator";
import { enforceCityScope } from "../../middleware/cityScope";

const router = Router();

router.get("/", authenticate, enforceCityScope, asyncHandler((req, res) => subscriberController.list(req, res)));
router.post(
  "/",
  authenticate,
  authorize([Role.ADMIN, Role.EDITOR]),
  validate(createSubscriberSchema),
  enforceCityScope,
  asyncHandler((req, res) => subscriberController.create(req, res))
);
router.post("/:id/unsubscribe", authenticate, asyncHandler((req, res) => subscriberController.unsubscribe(req, res)));

export default router;
