import express from "express";
import { AuthController } from "../controllers/auth.controller";
import { NotificationController } from "../controllers/notification.controller";

export const publicRouter = express.Router();

publicRouter.post("/api/auth/register", AuthController.register);
publicRouter.post("/api/auth/login", AuthController.login);
publicRouter.post("/api/auth/refresh_token", AuthController.refreshToken);
publicRouter.post("/api/notification/send-notification", NotificationController.sendNotification);
