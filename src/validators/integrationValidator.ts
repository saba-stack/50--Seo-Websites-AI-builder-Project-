import { z } from "zod";

export const upsertIntegrationSchema = z.object({
  body: z.object({
    cityId: z.string().uuid().optional(),
    provider: z.enum(["OPENAI", "ANTHROPIC", "DEEPSEEK", "SALESFORCE", "GMASS"]),
    apiKey: z.string().min(1),
    isEnabled: z.boolean().default(true),
    config: z.record(z.string(), z.unknown()).optional()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});
