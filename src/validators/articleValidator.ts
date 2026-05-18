import { z } from "zod";

export const createArticleSchema = z.object({
  body: z.object({
    cityId: z.string().uuid(),
    categoryId: z.string().uuid().optional(),
    title: z.string().min(5),
    summary: z.string().optional(),
    content: z.string().min(20),
    sourceUrl: z.string().url().optional(),
    sourceName: z.string().optional(),
    scheduledAt: z.coerce.date().optional()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const updateArticleSchema = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    summary: z.string().optional(),
    content: z.string().min(20).optional(),
    status: z.enum(["DRAFT", "REVIEW_PENDING", "APPROVED", "PUBLISHED", "REJECTED"]).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    internalLinks: z.array(z.string().url()).optional(),
    scheduledAt: z.coerce.date().optional()
  }),
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({}).default({})
});

export const generateAiForArticleSchema = z.object({
  body: z.object({
    type: z.enum(["SUMMARY", "REWRITE", "HEADLINE", "SEO", "NEWSLETTER", "SOCIAL_CAPTION"]),
    prompt: z.string().min(10)
  }),
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({}).default({})
});
