import { z, ZodType } from "zod";

export class TagValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().min(1).max(100).trim().regex(/^\S+$/, "Tags cannot contain spaces"),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().min(1).max(100).trim().regex(/^\S+$/, "Tags cannot contain spaces"),
  });

  static readonly DELETE: ZodType = z.string();
}
