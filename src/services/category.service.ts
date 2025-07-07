import { AuthenticatedRequest } from "../types/user.request";
import {
  CategoryResponse,
  CreateCategoryRequest,
  toCategoriesResponse,
  UpdateCategoryRequest,
} from "../models/category.model";
import { prismaClient } from "../config/database";
import { ResponseError } from "../errors/response.error";
import { capitalizeFirstLetter } from "../utils/string.utils";
import { Validation } from "../utils/validation";
import { CategoryValidation } from "../validations/category.validation";
import { CommonResponse } from "../utils/response";

export class CategoryService {
  static async get(request: AuthenticatedRequest): Promise<CategoryResponse[]> {
    const userId = request.payload?.id;

    return prismaClient.category.findMany({
      where: {
        OR: [{ userId: userId }, { userId: null }],
      },
      select: {
        id: true,
        name: true,
        userId: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  static async create(
    request: AuthenticatedRequest,
    categoryRequest: CreateCategoryRequest,
  ): Promise<CategoryResponse> {
    const requestBody = Validation.validate(CategoryValidation.CREATE, categoryRequest);
    const userId = request.payload?.id;
    await CategoryService.checkCategoryExistence(requestBody.name, userId);

    const category = await prismaClient.category.create({
      data: {
        name: capitalizeFirstLetter(requestBody.name),
        userId,
      },
    });

    return toCategoriesResponse(category);
  }

  static async update(
    request: AuthenticatedRequest,
    updateCategoryRequest: UpdateCategoryRequest,
  ): Promise<CategoryResponse> {
    const userId = request.payload?.id;
    const requestBody = Validation.validate(CategoryValidation.UPDATE, updateCategoryRequest);

    const isCategoryExist = await prismaClient.category.findUnique({
      where: {
        id: updateCategoryRequest.id,
      },
    });

    if (!isCategoryExist) {
      throw new ResponseError(404, "Category not found");
    }

    if (isCategoryExist.userId !== userId || isCategoryExist.userId === null) {
      throw new ResponseError(403, "You are not allowed to update this category.");
    }

    await CategoryService.checkCategoryExistence(requestBody.name, userId);

    const category = await prismaClient.category.update({
      where: {
        id: updateCategoryRequest.id,
      },
      data: {
        name: capitalizeFirstLetter(requestBody.name),
        userId,
      },
    });

    return toCategoriesResponse(category);
  }

  static async delete(request: AuthenticatedRequest, categoryId: string): Promise<CommonResponse> {
    const userId = request.payload?.id;
    const requestBody = Validation.validate(CategoryValidation.DELETE, categoryId);

    const isCategoryExist = await prismaClient.category.findUnique({
      where: {
        id: requestBody,
      },
    });

    if (!isCategoryExist) {
      throw new ResponseError(404, "Category not found");
    }

    if (isCategoryExist.userId !== userId || isCategoryExist.userId === null) {
      throw new ResponseError(403, "You are not allowed to delete this category.");
    }

    await prismaClient.category.delete({
      where: {
        id: categoryId,
      },
    });

    return { message: "Category deleted successfully" };
  }

  static async checkCategoryExistence(name: string, userId?: string) {
    const existingCategory = await prismaClient.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        OR: [{ userId }, { userId: null }],
      },
    });

    if (existingCategory) {
      throw new ResponseError(409, "Category already exists");
    }
  }
}
