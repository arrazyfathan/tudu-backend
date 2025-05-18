import { Validation } from "../utils/validation";
import { UserValidation } from "../validations/user.validation";
import { prismaClient } from "../config/database";
import { ResponseError } from "../errors/response.error";
import bcrypt from "bcrypt";
import { hash } from "../utils/hash";
import {
  LoginResponse,
  LoginUserRequest,
  RefreshTokenRequest,
  RegisterRequest,
  RegisterResponse,
  toLoginResponse,
  toRegisterResponse,
} from "../models/auth.model";
import { generateTokens } from "../utils/jwt";
import { AuthenticatedRequest } from "../types/user.request";

export class AuthService {
  static async register(request: RegisterRequest): Promise<RegisterResponse> {
    const registerRequest = Validation.validate(UserValidation.REGISTER, request);
    const totalUserWithSameUsername = await prismaClient.user.count({
      where: {
        username: registerRequest.username,
      },
    });

    if (totalUserWithSameUsername != 0) {
      throw new ResponseError(409, "User already exists");
    }

    const totalUserWithSameEmail = await prismaClient.user.count({
      where: {
        email: registerRequest.email,
      },
    });

    if (totalUserWithSameEmail != 0) {
      throw new ResponseError(409, "Email is already taken");
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const user = await prismaClient.user.create({
      data: registerRequest,
    });

    return toRegisterResponse(user);
  }

  static async login(request: LoginUserRequest): Promise<LoginResponse> {
    const loginRequest = Validation.validate(UserValidation.LOGIN, request);

    const user = await prismaClient.user.findUnique({
      where: {
        username: loginRequest.username,
      },
    });

    if (!user || user.deletedAt) {
      throw new ResponseError(401, "Username or password is wrong!");
    }

    const isPasswordMatch = await bcrypt.compare(loginRequest.password, user.password);

    if (!isPasswordMatch) {
      throw new ResponseError(401, "Username or password is wrong!");
    }

    const { access_token: accessToken, refresh_token: refreshToken } = generateTokens(user);
    await AuthService.addRefreshTokenToWhitelist(refreshToken, user.id);

    return toLoginResponse(user, accessToken, refreshToken);
  }

  static async refreshToken(request: RefreshTokenRequest): Promise<LoginResponse> {
    if (!request.refresh_token) {
      throw new ResponseError(400, "Refresh token is required!");
    }

    const savedRefreshToken = await AuthService.findRefreshToken(request.refresh_token);

    if (
      !savedRefreshToken ||
      savedRefreshToken.revoked === true ||
      Date.now() >= savedRefreshToken.expiredAt.getTime()
    ) {
      throw new ResponseError(401, "Unauthorized");
    }

    const user = await prismaClient.user.findUnique({
      where: {
        id: savedRefreshToken.userId,
      },
    });

    if (!user) {
      throw new ResponseError(401, "Unauthorized");
    }

    await AuthService.deleteRefreshTokenById(savedRefreshToken.id);
    const { access_token: accessToken, refresh_token: newRefreshToken } = generateTokens(user);
    await AuthService.addRefreshTokenToWhitelist(newRefreshToken, user.id);

    return toLoginResponse(user, accessToken, newRefreshToken);
  }

  static async logout(request: AuthenticatedRequest, refreshToken: string) {
    if (!refreshToken) {
      throw new ResponseError(400, "Refresh token is required!");
    }

    const userId = request.payload?.id;
    const token = await AuthService.findRefreshToken(refreshToken);
    if (!token || token.userId !== userId) {
      throw new ResponseError(404, "Session not found!");
    }

    await AuthService.deleteRefreshTokenById(token.id);
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
