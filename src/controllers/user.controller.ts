import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/user.request";
import { UserService } from "../services/user.service";
import { successResponse } from "../utils/response";
import { UpdateFcmTokenRequest } from "../models/user.model";

export class UserController {
  static async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const response = await UserService.get(req);
      res.status(200).json(successResponse("Successfully get user", response));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const response = await UserService.update(req);
      res.status(200).json(successResponse("Successfully update user", response));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const response = await UserService.delete(req);
      res.status(200).json(successResponse(response, null));
    } catch (error) {
      next(error);
    }
  }

  static async storeFcmToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const fcmToken = req.body as UpdateFcmTokenRequest;
      const response = await UserService.storeFcmToken(req, fcmToken);
      res.status(200).json(successResponse(response, null));
    } catch (error) {
      next(error);
    }
  }
}
