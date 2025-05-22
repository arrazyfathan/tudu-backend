import { Category } from "../../generated/prisma/client";

export type CategoryResponse = {
  id: string;
  name: string;
  userId: string | null;
};

export type CreateCategoryRequest = {
  name: string;
};

export type UpdateCategoryRequest = {
  id: string;
  name: string;
};

export function toCategoriesResponse(
  category: Pick<Category, "id" | "name" | "userId">,
): CategoryResponse {
  return {
    id: category.id,
    name: category.name,
    userId: category.userId,
  };
}
