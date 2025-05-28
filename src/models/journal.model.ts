import { Journal } from "../../generated/prisma/client";

export type JournalResponse = {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  } | null;
  tags: {
    id: string;
    name: string;
  }[];
};

export type CreateJournalRequest = {
  title: string;
  content: string;
  date: string;
  categoryId?: string | null;
  tagIds: string[];
};

export type UpdateJournalRequest = {
  title?: string;
  content?: string;
  date?: string;
  categoryId?: string | null;
  tagIds: string[];
};

export type MultipleDeleteJournalRequest = {
  ids: string[];
};

export type GetJournalRequest = {
  title?: string;
  page: number;
  size: number;
};

export function toJournalResponse(
  journal: Journal & {
    category: { id: string; name: string } | null;
    tags: { tag: { id: string; name: string } }[];
  },
): JournalResponse {
  return {
    id: journal.id,
    title: journal.title,
    content: journal.content,
    date: journal.date.toISOString(),
    createdAt: journal.createdAt.toISOString(),
    updatedAt: journal.updatedAt.toISOString(),
    category: journal.category,
    tags: journal.tags.map((t) => t.tag),
  };
}
