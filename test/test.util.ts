import { prismaClient } from "../src/config/database";
import bcrypt from "bcrypt";
import { Category, RefreshToken, User } from "../generated/prisma/client";
import supertest from "supertest";
import { app } from "../src/app";

export class AuthTest {
  static async delete() {
    await prismaClient.refreshToken.deleteMany({
      where: {
        user: {
          username: "test",
        },
      },
    });

    await prismaClient.user.deleteMany({
      where: {
        username: "test",
      },
    });
  }

  static async create() {
    await prismaClient.user.create({
      data: {
        username: "test",
        name: "test",
        email: "test",
        password: await bcrypt.hash("secret", 10),
      },
    });
  }

  static async get(): Promise<User> {
    const user = await prismaClient.user.findFirst({
      where: {
        username: "test",
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  static async getRefreshToken(): Promise<RefreshToken[]> {
    return prismaClient.refreshToken.findMany({
      where: {
        user: {
          username: "test",
        },
      },
    });
  }

  static async createAccessToken() {
    await AuthTest.create();
    const login = await supertest(app).post("/api/auth/login").send({
      username: "test",
      password: "secret",
    });
    return login.body.data.token.access_token;
  }
}

export class CategoryTest {
  static async delete() {
    await prismaClient.category.deleteMany({
      where: {
        user: {
          username: "test",
        },
      },
    });
  }

  static async create() {
    await prismaClient.category.create({
      data: {
        name: "test",
        user: {
          connect: {
            username: "test",
          },
        },
      },
    });
  }

  static async get(): Promise<Category> {
    const category = await prismaClient.category.findFirst({
      where: {
        name: "test",
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }

  static async getGlobalsCategory(): Promise<Category> {
    const category = await prismaClient.category.findFirst({
      where: {
        userId: null,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }
}
