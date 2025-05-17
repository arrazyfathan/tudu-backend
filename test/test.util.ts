import {prismaClient} from "../src/config/database";
import bcrypt from "bcrypt";
import {User} from "../generated/prisma/client";

export class AuthTest {

    static async delete() {
        await prismaClient.refreshToken.deleteMany({
            where: {
                User: {
                    username: "test"
                }
            }
        });

        await prismaClient.user.deleteMany({
            where: {
                username: "test"
            }
        });
    }

    static async create() {
        await prismaClient.user.create({
            data: {
                username: "test",
                name: "test",
                email: "test",
                password: await bcrypt.hash("secret", 10),
            }
        });
    }

    static async get(): Promise<User> {
        const user = await prismaClient.user.findFirst({
            where: {
                username: "test"
            }
        })

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    }
}