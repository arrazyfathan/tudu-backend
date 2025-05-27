import { prismaClient } from "../src/config/database";
import bcrypt from "bcrypt";
import { Category, Journal, RefreshToken, Tag, User } from "../generated/prisma/client";
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

export class TagTest {
  static async delete() {
    await prismaClient.tag.deleteMany({
      where: {
        user: {
          username: "test",
        },
      },
    });
  }

  static async create() {
    await prismaClient.tag.create({
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

  static async get(): Promise<Tag> {
    const tag = await prismaClient.tag.findFirst({
      where: {
        name: "test",
      },
    });

    if (!tag) {
      throw new Error("Tag not found");
    }

    return tag;
  }

  static async getGlobalsCategory(): Promise<Tag> {
    const tag = await prismaClient.tag.findFirst({
      where: {
        userId: null,
      },
    });

    if (!tag) {
      throw new Error("Tag not found");
    }

    return tag;
  }
}

export class JournalTest {
  static async delete() {
    await prismaClient.journal.deleteMany({
      where: {
        user: {
          username: "test",
        },
      },
    });
  }

  static async create(): Promise<Journal> {
    const categoryId = "2a6c6c4e-3afc-43b0-b7f9-eb7fa405de58";
    const tagIds = ["ab49ac8c-385e-4579-b675-0245d7a9a151", "37d2d127-6366-431f-9a17-2ef5890a761a"];
    const user = await prismaClient.user.findFirstOrThrow({ where: { username: "test" } });

    return prismaClient.journal.create({
      data: {
        title: "title journal",
        content: "content journal",
        date: new Date(),
        categoryId,
        userId: user.id,
        tags: {
          create: tagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
    });
  }

  static async createMultipleJournal() {
    const categoryId = "2a6c6c4e-3afc-43b0-b7f9-eb7fa405de58";
    const tagIds = ["ab49ac8c-385e-4579-b675-0245d7a9a151", "37d2d127-6366-431f-9a17-2ef5890a761a"];
    const user = await prismaClient.user.findFirstOrThrow({ where: { username: "test" } });

    for (let i = 0; i < 5; i++) {
      await prismaClient.journal.create({
        data: {
          title: `title journal (#${i + 1})`,
          content: "content journal",
          date: new Date(),
          categoryId,
          userId: user.id,
          tags: {
            create: tagIds.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        },
      });
    }
  }
}
