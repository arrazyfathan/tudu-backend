import { z, ZodType } from "zod";

export class TagValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().min(1).max(100).trim(),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().min(1).max(100).trim(),
  });

  static readonly DELETE: ZodType = z.string();
}
