import { z } from "zod";

export const createCitySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    state: z.string().min(2),
    country: z.string().default("US"),
    timezone: z.string().min(2)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});
