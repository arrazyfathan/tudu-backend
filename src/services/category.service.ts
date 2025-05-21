import { AuthenticatedRequest } from "../types/user.request";
import {
  CategoryResponse,
  CreateCategoryRequest,
  toCategoriesResponse,
} from "../models/category.model";
import { prismaClient } from "../config/database";
import { ResponseError } from "../errors/response.error";
import { capitalizeFirstLetter } from "../utils/string.utils";
import { Validation } from "../utils/validation";
import { CategoryValidation } from "../validations/category.validation";

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

    const existingCategory = await prismaClient.category.findFirst({
      where: {
        name: {
          equals: requestBody.name,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      throw new ResponseError(409, "Category already exists");
    }

    const category = await prismaClient.category.create({
      data: {
        name: capitalizeFirstLetter(requestBody.name),
        userId,
      },
    });

    return toCategoriesResponse(category);
  }
}
