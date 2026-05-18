import { z } from "zod";

export const moderationActionSchema = z.object({
  body: z.object({
    action: z.enum(["APPROVE", "REJECT", "EDIT", "ESCALATE"]),
    notes: z.string().optional(),
    content: z.string().optional()
  }),
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({}).default({})
});
