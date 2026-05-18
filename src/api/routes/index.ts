import { Router } from "express";
import authRoutes from "./authRoutes";
import cityRoutes from "./cityRoutes";
import articleRoutes from "./articleRoutes";
import moderationRoutes from "./moderationRoutes";
import aiRoutes from "./aiRoutes";
import rankingRoutes from "./rankingRoutes";
import analyticsRoutes from "./analyticsRoutes";
import integrationRoutes from "./integrationRoutes";
import subscriberRoutes from "./subscriberRoutes";
import campaignRoutes from "./campaignRoutes";
import scrapingRoutes from "./scrapingRoutes";
import settingRoutes from "./settingRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/cities", cityRoutes);
router.use("/articles", articleRoutes);
router.use("/moderation", moderationRoutes);
router.use("/ai", aiRoutes);
router.use("/rankings", rankingRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/integrations", integrationRoutes);
router.use("/subscribers", subscriberRoutes);
router.use("/email-campaigns", campaignRoutes);
router.use("/scraping", scrapingRoutes);
router.use("/settings", settingRoutes);

export default router;
