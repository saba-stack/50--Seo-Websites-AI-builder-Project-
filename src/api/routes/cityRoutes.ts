import { Router } from "express";
import { Role } from "@prisma/client";
import { cityController } from "../../controllers/cityController";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createCitySchema } from "../../validators/cityValidator";

const router = Router();

router.get("/", authenticate, asyncHandler((req, res) => cityController.list(req, res)));
router.get("/:id", authenticate, asyncHandler((req, res) => cityController.get(req, res)));
router.post(
  "/",
  authenticate,
  authorize([Role.ADMIN]),
  validate(createCitySchema),
  asyncHandler((req, res) => cityController.create(req, res))
);

export default router;
