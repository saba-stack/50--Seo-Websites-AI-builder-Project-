import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(20)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["ADMIN", "EDITOR", "REVIEWER"]),
    cityId: z.string().uuid().optional()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});
