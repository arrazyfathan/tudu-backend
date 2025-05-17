import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { successResponse } from "../utils/response";
import { LoginUserRequest, RefreshTokenRequest, RegisterRequest } from "../models/auth.model";
import { AuthenticatedRequest } from "../types/user.request";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const request: RegisterRequest = req.body as RegisterRequest;
      const response = await AuthService.register(request);
      res.status(201).json(successResponse("User registered successfully", response));
    } catch (e) {
      next(e);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const request: LoginUserRequest = req.body as LoginUserRequest;
      const response = await AuthService.login(request);
      res.status(200).json(successResponse("User login successfully", response));
    } catch (e) {
      next(e);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const request: RefreshTokenRequest = req.body as RefreshTokenRequest;
      const response = await AuthService.refreshToken(request);
      res.status(200).json(successResponse("Refresh token successfully", response));
    } catch (e) {
      next(e);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken: string = req.body.refresh_token as string;
      await AuthService.logout(req, refreshToken);
      res.status(200).json(successResponse("Logout successfully", null));
    } catch (e) {
      next(e);
    }
  }
}
