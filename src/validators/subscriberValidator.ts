import { z } from "zod";

export const createSubscriberSchema = z.object({
  body: z.object({
    cityId: z.string().uuid(),
    email: z.string().email(),
    source: z.string().optional(),
    tags: z.array(z.string()).optional()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});
