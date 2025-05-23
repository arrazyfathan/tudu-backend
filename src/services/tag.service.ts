import { AuthenticatedRequest } from "../types/user.request";
import { prismaClient } from "../config/database";
import { TagResponse } from "../models/tag.model";

export class TagService {
  static async get(request: AuthenticatedRequest): Promise<TagResponse[]> {
    const userId = request.payload?.id;
    return prismaClient.tag.findMany({
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

  static async create() {}

  static async update() {}

  static async delete() {}
}
