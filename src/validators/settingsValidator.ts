import { z } from "zod";

export const upsertSettingSchema = z.object({
  body: z.object({
    cityId: z.string().uuid().optional(),
    scope: z.enum(["GLOBAL", "CITY"]),
    key: z.string().min(2),
    value: z.unknown()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});
