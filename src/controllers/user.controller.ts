import {Request, Response, NextFunction} from "express";
import {CreateUserRequest} from "../models/user.model";
import {UserService} from "../services/user.service";
import {successResponse} from "../utils/response";
import {LoginUserRequest} from "../models/auth.model";

export class UserController {

    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const request: CreateUserRequest = req.body as CreateUserRequest;
            const response = await UserService.register(request);
            res.status(201).json(successResponse("User registered successfully", response));
        } catch (e) {
            next(e);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const request: LoginUserRequest = req.body as LoginUserRequest;
            const response = await UserService.login(request);
            res.status(200).json(successResponse("User login successfully", response));
        } catch (e) {
            next(e);
        }
    }
}