import {Request, Response, NextFunction} from "express";
import {AuthService} from "../services/auth.service";
import {successResponse} from "../utils/response";
import {LoginUserRequest, RegisterRequest} from "../models/auth.model";

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
}