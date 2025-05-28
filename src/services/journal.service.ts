import { AuthenticatedRequest } from "../types/user.request";
import {
  CreateJournalRequest,
  GetJournalRequest,
  JournalResponse,
  toJournalResponse,
  UpdateJournalRequest,
} from "../models/journal.model";
import { Validation } from "../utils/validation";
import { JournalValidation } from "../validations/journal.validation";
import { prismaClient } from "../config/database";
import { ResponseError } from "../errors/response.error";
import { Pageable } from "../models/page";
import { CommonResponse } from "../utils/response";

export class JournalService {
  static async create(
    auth: AuthenticatedRequest,
    request: CreateJournalRequest,
  ): Promise<JournalResponse> {
    const userId = auth.payload?.id;
    const requestBody = Validation.validate(JournalValidation.CREATE, request);

    const categoryId = await validateAndNormalizeCategoryId(userId, requestBody.categoryId);
    const date = validateDate(requestBody.date);
    await validateTagsExist(requestBody.tagIds);

    const journal = await prismaClient.journal.create({
      data: {
        title: requestBody.title,
        content: requestBody.content,
        date,
        categoryId,
        userId: userId!,
        tags: {
          create: requestBody.tagIds.map((tagId) => ({
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

  static async update(
    auth: AuthenticatedRequest,
    request: UpdateJournalRequest,
    journalId: string,
  ): Promise<JournalResponse> {
    const userId = auth.payload?.id;
    const requestBody = Validation.validate(JournalValidation.UPDATE, request);

    const journal = await prismaClient.journal.findFirst({
      where: {
        id: journalId,
        userId: userId,
      },
    });

    if (!journal) {
      throw new ResponseError(404, "Journal not found");
    }

    const categoryId = await validateAndNormalizeCategoryId(userId, requestBody.categoryId);

    const date = validateDate(requestBody.date);

    await validateTagsExist(requestBody.tagIds);

    await prismaClient.journalTag.deleteMany({
      where: {
        journalId,
      },
    });

    const updatedJournal = await prismaClient.journal.update({
      where: {
        id: journalId,
      },
      data: {
        title: requestBody.title,
        content: requestBody.content,
        date,
        categoryId,
        tags: {
          create: requestBody.tagIds.map((tagId) => ({
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

    return toJournalResponse(updatedJournal);
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

  static async multipleDelete(auth: AuthenticatedRequest, ids: string[]): Promise<CommonResponse> {
    const userId = auth.payload?.id;
    const journalIds = Validation.validate(JournalValidation.MULTIPLE_DELETE, ids);

    const result = await prismaClient.journal.updateMany({
      where: {
        id: { in: journalIds },
        userId: userId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new ResponseError(404, "No matching journals found");
    }

    return { message: "Journal deleted successfully" };
  }
}

async function validateAndNormalizeCategoryId(
  userId: string | undefined,
  categoryId: string | undefined | "" | null,
): Promise<string | null> {
  const normalizedCategoryId = categoryId === "" || categoryId === undefined ? null : categoryId;

  if (normalizedCategoryId) {
    const category = await prismaClient.category.findFirst({
      where: {
        id: normalizedCategoryId,
        OR: [{ userId }, { userId: null }],
      },
    });

    if (!category) {
      throw new ResponseError(404, "Category not found");
    }
  }

  return normalizedCategoryId;
}

function validateDate(dateString: string | undefined): Date {
  const date = dateString ? new Date(dateString) : new Date();

  if (isNaN(date.getTime())) {
    throw new ResponseError(400, "Invalid date format.");
  }

  return date;
}

async function validateTagsExist(tagIds: string[]): Promise<void> {
  const foundTags = await prismaClient.tag.findMany({
    where: {
      id: { in: tagIds },
    },
    select: { id: true },
  });

  const foundTagIds = foundTags.map((tag) => tag.id);
  const missingTags = tagIds.filter((id) => !foundTagIds.includes(id));

  if (missingTags.length > 0) {
    throw new ResponseError(404, "Tag not found");
  }
}
