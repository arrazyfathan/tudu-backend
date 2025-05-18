import { z, ZodType } from "zod";

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    email: z.string().email(),
    username: z.string().min(1).max(100),
    password: z.string().min(6).max(100),
    name: z.string().min(1).max(100),
  });

  static readonly LOGIN: ZodType = z.object({
    username: z.string().min(1).max(100),
    password: z.string().min(1).max(100),
  });

  static readonly UPDATE: ZodType = z.object({
    password: z.string().min(6).max(100).optional(),
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
  });
}
