import { NextFunction, Request, Response } from "express";
import { Notification } from "../models/notification.model";
import { NotificationService } from "../services/notification.service";
import { successResponse } from "../utils/response";

export class NotificationController {
  static async sendNotification(request: Request, response: Response, next: NextFunction) {
    try {
      const notificationBody = request.body as Notification;
      await NotificationService.send(notificationBody);
      response.status(200).json(successResponse("Notification sent!", null));
    } catch (error) {
      next(error);
    }
  }
}
