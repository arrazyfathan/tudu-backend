import { successResponse, successResponsePaging } from "../utils/response";
import { JournalService } from "../services/journal.service";
import { AuthenticatedRequest } from "../types/user.request";
import { NextFunction, Response } from "express";
import { CreateJournalRequest, GetJournalRequest } from "../models/journal.model";

export class JournalController {
  static async createJournal(
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) {
    try {
      const requestBody = request.body as CreateJournalRequest;
      const result = await JournalService.create(request, requestBody);
      response.status(200).json(successResponse("Journal created successfully", result));
    } catch (error) {
      next(error);
    }
  }

  static async getJournals(request: AuthenticatedRequest, response: Response, next: NextFunction) {
    try {
      const requestGetJournal: GetJournalRequest = {
        title: request.query.name as string,
        page: request.query.page ? Number(request.query.page) : 1,
        size: request.query.size ? Number(request.query.size) : 10,
      };

      const result = await JournalService.get(request, requestGetJournal);
      response
        .status(200)
        .json(successResponsePaging("Journals fetched successfully", result.data, result.paging));
    } catch (error) {
      next(error);
    }
  }
}
