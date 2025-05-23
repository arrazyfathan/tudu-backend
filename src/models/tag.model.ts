import { Tag } from "../../generated/prisma/client";

export type TagResponse = {
  id: string;
  name: string;
  userId: string | null;
};

export type CreateTagRequest = {
  name: string;
};

export type UpdateTagRequest = {
  id: string;
  name: string;
};

export function toTagResponse(tag: Pick<Tag, "id" | "name" | "userId">): TagResponse {
  return {
    id: tag.id,
    name: tag.name,
    userId: tag.userId,
  };
}
