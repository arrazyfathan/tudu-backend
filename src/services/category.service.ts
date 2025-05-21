import { AuthenticatedRequest } from "../types/user.request";
import { CategoryResponse } from "../models/category.model";
import { prismaClient } from "../config/database";

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
        createdAt: "desc",
      },
    });
  }
}
