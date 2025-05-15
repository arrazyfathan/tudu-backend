import {User} from "../../generated/prisma/client";

export type UserResponse = {
    id: string;
    email: string;
    username: string;
    name: string;
    token: Token;
}

export type Token = {
    accessToken: string;
    refreshToken: string;
}

export type CreateUserRequest = {
    email: string;
    username: string;
    name: string;
    password: string;
}

export function toUserResponse(user: User, accessToken: string, refreshToken: string): UserResponse {
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        token: {
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    }
}