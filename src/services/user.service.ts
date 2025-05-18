import { AuthenticatedRequest } from "../types/user.request";
import { toUserResponse, UpdateUserRequest, UserResponse } from "../models/user.model";
import { prismaClient } from "../config/database";
import { ResponseError } from "../errors/response.error";
import { Validation } from "../utils/validation";
import { UserValidation } from "../validations/user.validation";
import { User } from "../../generated/prisma/client";
import bcrypt from "bcrypt";

export class UserService {
  static async get(request: AuthenticatedRequest): Promise<UserResponse> {
    const userId = request.payload?.id;
    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
      },
    });

    if (!user) {
      throw new ResponseError(404, "User not found!");
    }

    return toUserResponse(user);
  }

  static async update(request: AuthenticatedRequest): Promise<UserResponse> {
    const userId = request.payload?.id;
    const requestBody = request.body as UpdateUserRequest;
    const data: Partial<User> = {};

    const updateRequest = Validation.validate(UserValidation.UPDATE, requestBody);

    if (updateRequest.name) {
      data.name = updateRequest.name;
    }

    if (updateRequest.email) {
      const existingUser = await prismaClient.user.findUnique({
        where: { email: updateRequest.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ResponseError(409, "Email is already taken");
      }

      data.email = updateRequest.email;
    }

    if (updateRequest.password) {
      data.password = await bcrypt.hash(updateRequest.password, 10);
    }

    const user = await prismaClient.user.update({
      where: {
        id: userId,
      },
      data,
    });

    return toUserResponse(user);
  }

  static async delete(request: AuthenticatedRequest): Promise<string> {
    const userId = request.payload?.id;
    await prismaClient.user.update({
      where: {
        id: userId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return "User deleted successfully";
  }
}
