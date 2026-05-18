import { z } from "zod";

export const runScrapingSchema = z.object({
  body: z.object({
    cityId: z.string().uuid().optional(),
    sourceType: z.enum(["REDDIT", "RSS", "BBC", "REUTERS", "TIKTOK", "INSTAGRAM", "FACEBOOK", "WEB"]),
    sourceUrl: z.string().url(),
    metadata: z.record(z.string(), z.unknown()).optional()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});
