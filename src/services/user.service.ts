import {CreateUserRequest} from "../models/user.model";
import {Validation} from "../utils/validation";
import {UserValidation} from "../validations/user.validation";
import {prismaClient} from "../config/database";
import {ResponseError} from "../errors/response.error";
import bcrypt from "bcrypt";
import {hash} from "../utils/hash";
import {RegisterResponse, toRegisterResponse} from "../models/auth.model";

export class UserService {

    static async register(request: CreateUserRequest): Promise<RegisterResponse> {
        const registerRequest = Validation.validate(UserValidation.REGISTER, request);
        const totalUserWithSameUsername = await prismaClient.user.count({
            where: {
                username: registerRequest.username
            }
        });

        if (totalUserWithSameUsername != 0) {
            throw new ResponseError(409, "User already exists");
        }

        const totalUserWithSameEmail = await prismaClient.user.count({
            where: {
                email: registerRequest.email
            }
        });

        if (totalUserWithSameEmail != 0) {
            throw new ResponseError(409, "Email is already taken");
        }

        registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

        const user = await prismaClient.user.create({
            data: registerRequest
        });

        return toRegisterResponse(user);
    }


    static async addRefreshTokenToWhitelist(refreshToken: string, userId: string) {
        return prismaClient.refreshToken.create({
            data: {
                hashedToken: hash(refreshToken),
                userId,
                expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
            },
        });
    }

    static async findRefreshToken(token: string) {
        return prismaClient.refreshToken.findUnique({
            where: {
                hashedToken: hash(token),
            },
        });
    }

    static async deleteRefreshTokenById(id: string) {
        return prismaClient.refreshToken.update({
            where: {
                id,
            },
            data: {
                revoked: true,
            },
        });
    }

    static async revokeTokens(userId: string) {
        return prismaClient.refreshToken.updateMany({
            where: {
                userId,
            },
            data: {
                revoked: true,
            },
        });
    }
}