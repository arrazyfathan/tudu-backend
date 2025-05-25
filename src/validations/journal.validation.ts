import { z } from "zod";

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

  static readonly DELETE = z.object({
    id: z.string(),
  });
}
