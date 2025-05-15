import {CreateUserRequest, toUserResponse, UserResponse} from "../models/user.model";
import {Validation} from "../utils/validation";
import {UserValidation} from "../validations/user.validation";
import {prismaClient} from "../config/database";
import {ResponseError} from "../errors/response.error";
import bcrypt from "bcrypt";
import {generateTokens} from "../utils/jwt";
import {hash} from "../utils/hash";
import {User} from "../../generated/prisma/client";

export class UserService {

    static async register(request: CreateUserRequest): Promise<UserResponse> {
        const registerRequest = Validation.validate(UserValidation.REGISTER, request);
        const totalUserWithSameUsername = await prismaClient.user.count({
            where: {
                username: registerRequest.username
            }
        });

        if (totalUserWithSameUsername != 0) {
            throw new ResponseError(400, "User already exists");
        }

        registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

        const user = await prismaClient.user.create({
            data: registerRequest
        });

        const {accessToken, refreshToken} = generateTokens(user);
        await UserService.addRefreshTokenToWhitelist(refreshToken, user.id);

        return toUserResponse(user, accessToken, refreshToken);
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