import { AuthenticatedRequest } from "../types/user.request";
import { CreateJournalRequest, JournalResponse, toJournalResponse } from "../models/journal.model";
import { Validation } from "../utils/validation";
import { JournalValidation } from "../validations/journal.validation";
import { prismaClient } from "../config/database";
import { ResponseError } from "../errors/response.error";

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
        userId,
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
}
