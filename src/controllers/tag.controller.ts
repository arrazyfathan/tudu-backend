import { AuthenticatedRequest } from "../types/user.request";
import { NextFunction, Response } from "express";
import { successResponse } from "../utils/response";
import { TagService } from "../services/tag.service";

export class TagController {
  static async getTags(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const response = await TagService.get(req);
      res.status(200).json(successResponse("Successfully get tags", response));
    } catch (error) {
      next(error);
    }
  }
  static async createTag() {}
  static async updateTag() {}
  static async deleteTag() {}
}
