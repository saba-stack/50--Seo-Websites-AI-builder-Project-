import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import routes from "./api/routes";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { swaggerSpec } from "./docs/swagger";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimit } from "./middleware/rateLimit";
import { sendSuccess } from "./utils/response";
// --- ADD THESE TWO IMPORTS ---
import { statsController } from "./controllers/statsController";
import { asyncHandler } from "./middleware/asyncHandler";

export function createApp() {
  const app = express();

  // This is the updated CORS block to allow Lovable
  const lovableFrontendOrigin = "https://alyson-ai-nexus.lovable.app";
  
  app.use(
    cors({
      origin: (origin, callback) => {
        const configuredOrigins = env.CORS_ORIGIN === "*" 
          ? ["*"] 
          : env.CORS_ORIGIN.split(",");
          
        if (!origin || configuredOrigins.includes("*") || origin === lovableFrontendOrigin || configuredOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true
    })
  );

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(rateLimit);
  app.use(pinoHttp({ logger }));

  app.get("/health", (_req, res) => sendSuccess(res, { status: "ok", service: "alyson-ai-backend" }));
  
  // --- THIS LINE ENABLES THE DASHBOARD DATA ---
  app.get("/stats", asyncHandler((req, res) => statsController.getStats(req, res)));

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api", routes);
  app.use(errorHandler);

  return app;
}
