import express from "express";
import {AuthController} from "../controllers/auth.controller";

export const publicRouter = express.Router();

publicRouter.post("/api/auth/register", AuthController.register);
publicRouter.post("/api/auth/login", AuthController.login);
publicRouter.post("/api/auth/refresh_token", AuthController.refreshToken)