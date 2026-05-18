import { z } from "zod";

export const trackEventSchema = z.object({
  body: z.object({
    cityId: z.string().uuid(),
    articleId: z.string().uuid().optional(),
    subscriberId: z.string().uuid().optional(),
    eventType: z.enum([
      "VIEW",
      "CLICK",
      "ENGAGEMENT",
      "REVENUE",
      "EMAIL_OPEN",
      "EMAIL_CLICK",
      "SUBSCRIBE",
      "UNSUBSCRIBE"
    ]),
    source: z.string().optional(),
    value: z.number().optional(),
    metadata: z.record(z.string(), z.unknown()).optional()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});
