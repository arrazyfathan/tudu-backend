import { z, ZodType } from "zod";

export class JournalValidation {
  static readonly CREATE = z.object({
    title: z.string().min(1).max(100),
    content: z.string().min(1),
    date: z.string(),
    categoryId: z.string().optional().nullable(),
    tagIds: z.array(z.string()).optional(),
  });

  static readonly UPDATE = z.object({
    title: z.string().min(1).max(100),
    content: z.string().min(1),
    date: z.string(),
    categoryId: z.string().optional().nullable(),
    tagIds: z.array(z.string()).optional(),
  });

  static readonly DELETE = z.string();

  static readonly MULTIPLE_DELETE = z.array(z.string());

  static readonly GET: ZodType = z.object({
    title: z.string().optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).max(100).positive(),
  });
}
