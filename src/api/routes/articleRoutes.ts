import { Router } from "express";
import { Role } from "@prisma/client";
import { articleController } from "../../controllers/articleController";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticate, authorize } from "../../middleware/auth";
import { enforceCityScope } from "../../middleware/cityScope";
import { validate } from "../../middleware/validate";
import { createArticleSchema, generateAiForArticleSchema, updateArticleSchema } from "../../validators/articleValidator";

const router = Router();

router.get("/", authenticate, enforceCityScope, asyncHandler((req, res) => articleController.list(req, res)));
router.post(
  "/",
  authenticate,
  authorize([Role.ADMIN, Role.EDITOR]),
  validate(createArticleSchema),
  enforceCityScope,
  asyncHandler((req, res) => articleController.create(req, res))
);
router.patch(
  "/:id",
  authenticate,
  authorize([Role.ADMIN, Role.EDITOR, Role.REVIEWER]),
  validate(updateArticleSchema),
  asyncHandler((req, res) => articleController.update(req, res))
);
router.delete("/:id", authenticate, authorize([Role.ADMIN, Role.EDITOR]), asyncHandler((req, res) => articleController.remove(req, res)));
router.post("/:id/publish", authenticate, authorize([Role.ADMIN, Role.EDITOR]), asyncHandler((req, res) => articleController.publish(req, res)));
router.post(
  "/:id/generate",
  authenticate,
  authorize([Role.ADMIN, Role.EDITOR]),
  validate(generateAiForArticleSchema),
  asyncHandler((req, res) => articleController.generate(req, res))
);

export default router;
