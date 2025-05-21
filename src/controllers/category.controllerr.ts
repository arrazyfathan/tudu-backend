import { AuthenticatedRequest } from "../types/user.request";
import { NextFunction, Response } from "express";
import { CategoryService } from "../services/category.service";
import { successResponse } from "../utils/response";
import { CreateCategoryRequest } from "../models/category.model";

export class CategoryController {
  static async getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const response = await CategoryService.get(req);
      res.status(200).json(successResponse("Successfully get categories", response));
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const requestBody = req.body as CreateCategoryRequest;
      const response = await CategoryService.create(req, requestBody);
      res.status(201).json(successResponse("Successfully create category", response));
    } catch (error) {
      next(error);
    }
  }
}
