import swaggerJSDoc from "swagger-jsdoc";
import { env } from "../config/env";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Alyson AI API",
      version: "1.0.0",
      description: "Backend APIs for Alyson AI local news intelligence platform"
    },
    servers: [{ url: `http://localhost:${env.PORT}/api` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
            meta: { type: "object" }
          }
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string" },
            code: { type: "string" }
          }
        }
      }
    }
  },
  apis: ["src/api/routes/*.ts"]
};

export const swaggerSpec = swaggerJSDoc(options);
