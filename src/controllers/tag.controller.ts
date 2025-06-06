import { AuthenticatedRequest } from "../types/user.request";
import { NextFunction, Response } from "express";
import { successResponse } from "../utils/response";
import { TagService } from "../services/tag.service";
import { CreateTagRequest, UpdateTagRequest } from "../models/tag.model";

export class TagController {
  static async getTags(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const response = await TagService.get(req);
      res.status(200).json(successResponse("Successfully get tags", response));
    } catch (error) {
      next(error);
    }
  }

  static async createTag(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const requestBody = req.body as CreateTagRequest;
      const response = await TagService.create(req, requestBody);
      res.status(200).json(successResponse("Successfully create tag", response));
    } catch (error) {
      next(error);
    }
  }

  static async updateTag(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const requestBody = req.body as UpdateTagRequest;
      requestBody.id = req.params.tagId;
      const response = await TagService.update(req, requestBody);
      res.status(200).json(successResponse("Successfully update tag", response));
    } catch (error) {
      next(error);
    }
  }

  static async deleteTag(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tagId = req.params.tagId;
      const response = await TagService.delete(req, tagId);
      res.status(200).json(successResponse(response.message, null));
    } catch (error) {
      next(error);
    }
  }
}
