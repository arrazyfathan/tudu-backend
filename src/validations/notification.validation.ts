import { z, ZodType } from "zod";

export class NotificationValidation {
  static readonly SEND: ZodType = z.object({
    title: z.string(),
    body: z.string(),
    token: z.string(),
  });
}
