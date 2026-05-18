import { z } from "zod";

export const aiGenerateSchema = z.object({
  body: z.object({
    cityId: z.string().uuid(),
    articleId: z.string().uuid().optional(),
    type: z.enum(["SUMMARY", "REWRITE", "HEADLINE", "SEO", "NEWSLETTER", "SOCIAL_CAPTION"]),
    prompt: z.string().min(10),
    preferredProvider: z.enum(["OPENAI", "CLAUDE", "DEEPSEEK"]).optional()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});
