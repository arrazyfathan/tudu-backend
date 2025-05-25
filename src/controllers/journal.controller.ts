import { successResponse } from "../utils/response";
import { JournalService } from "../services/journal.service";

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
}
