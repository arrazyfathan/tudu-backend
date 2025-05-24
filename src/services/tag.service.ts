import { AuthenticatedRequest } from "../types/user.request";
import { prismaClient } from "../config/database";
import { CreateTagRequest, TagResponse, toTagResponse } from "../models/tag.model";
import { Validation } from "../utils/validation";
import { TagValidation } from "../validations/tag.validation";
import { ResponseError } from "../errors/response.error";

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

  static async create(
    request: AuthenticatedRequest,
    requestBody: CreateTagRequest,
  ): Promise<TagResponse> {
    const userId = request.payload?.id;
    const requestCreateTag = Validation.validate(TagValidation.CREATE, requestBody);
    await TagService.checkTagExistence(requestCreateTag.name, userId);

    const tag = await prismaClient.tag.create({
      data: {
        name: requestCreateTag.name.toLowerCase(),
        userId,
      },
    });

    return toTagResponse(tag);
  }

  static async update() {}

  static async delete() {}

  static async checkTagExistence(name: string, userId?: string) {
    const existingTag = await prismaClient.tag.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        OR: [{ userId }, { userId: null }],
      },
    });

    if (existingTag) {
      throw new ResponseError(409, "Tag already exists");
    }
  }
}
