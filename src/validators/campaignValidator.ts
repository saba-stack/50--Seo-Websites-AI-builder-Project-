import { z } from "zod";

export const createCampaignSchema = z.object({
  body: z.object({
    cityId: z.string().uuid(),
    title: z.string().min(3),
    subject: z.string().min(3),
    htmlContent: z.string().min(10),
    textContent: z.string().optional(),
    type: z.enum(["NEWSLETTER", "PROMOTIONAL"]),
    provider: z.enum(["SALESFORCE", "GMASS"]).optional(),
    scheduledAt: z.coerce.date().optional()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});
