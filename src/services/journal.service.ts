import { AuthenticatedRequest } from "../types/user.request";
import {
  CreateJournalRequest,
  GetJournalRequest,
  JournalResponse,
  toJournalResponse,
} from "../models/journal.model";
import { Validation } from "../utils/validation";
import { JournalValidation } from "../validations/journal.validation";
import { prismaClient } from "../config/database";
import { ResponseError } from "../errors/response.error";
import { Pageable } from "../models/page";
import { CommonResponse } from "../utils/response";

export class JournalService {
  static async create(
    request: AuthenticatedRequest,
    requestBody: CreateJournalRequest,
  ): Promise<JournalResponse> {
    const userId = request.payload?.id;
    const validated = Validation.validate(JournalValidation.CREATE, requestBody);

    const categoryId =
      validated.categoryId === "" || validated.categoryId === undefined
        ? null
        : validated.categoryId;

    if (categoryId) {
      const category = await prismaClient.category.findFirst({
        where: {
          id: categoryId,
          OR: [{ userId }, { userId: null }],
        },
      });

      if (!category) {
        throw new ResponseError(404, "Category not found");
      }
    }

    const date = validated.date ? new Date(validated.date) : new Date();

    if (isNaN(date.getTime())) {
      throw new ResponseError(400, "Invalid date format.");
    }

    const foundTags = await prismaClient.tag.findMany({
      where: {
        id: { in: validated.tagIds },
      },
      select: { id: true },
    });

    const foundTagIds = foundTags.map((tag) => tag.id);
    const missingTags = validated.tagIds.filter((id) => !foundTagIds.includes(id));

    if (missingTags.length > 0) {
      throw new ResponseError(404, "Tag not found");
    }

    const journal = await prismaClient.journal.create({
      data: {
        title: validated.title,
        content: validated.content,
        date,
        categoryId,
        userId: userId!,
        tags: {
          create: validated.tagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return toJournalResponse(journal);
  }

  static async get(
    auth: AuthenticatedRequest,
    request: GetJournalRequest,
  ): Promise<Pageable<JournalResponse>> {
    const userId = auth.payload?.id;
    const getRequest = Validation.validate(JournalValidation.GET, request);
    const skip = (getRequest.page - 1) * request.size;

    const filters = [];

    if (getRequest.title) {
      filters.push({
        OR: [
          {
            title: {
              contains: getRequest.title,
              mode: "insensitive" as const,
            },
          },
          {
            content: {
              contains: getRequest.title,
              mode: "insensitive" as const,
            },
          },
        ],
      });
    }

    filters.push({
      deletedAt: {
        equals: null,
      },
    });

    const journals = await prismaClient.journal.findMany({
      where: {
        userId: userId,
        AND: filters,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: getRequest.size,
      skip: skip,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const total = await prismaClient.journal.count({
      where: {
        userId: userId,
        AND: filters,
      },
    });

    return {
      data: journals.map((journal) => toJournalResponse(journal)),
      paging: {
        current_page: getRequest.page,
        total_page: Math.ceil(total / getRequest.size),
        total_items: total,
        size: getRequest.size,
      },
    };
  }

  static async delete(auth: AuthenticatedRequest, id: string): Promise<CommonResponse> {
    const userId = auth.payload?.id;
    const journalId = Validation.validate(JournalValidation.DELETE, id);

    const journal = await prismaClient.journal.findFirst({
      where: {
        id: journalId,
        userId: userId,
      },
    });

    if (!journal) {
      throw new ResponseError(404, "Journal not found");
    }

    await prismaClient.journal.update({
      where: {
        id: journalId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: "Journal deleted successfully" };
  }
}
