import {User} from "../../generated/prisma/client";
import {UserResponse} from "./user.model";
import {Token} from "./token.model";

export type RegisterResponse = {
    id: string;
    email: string;
    username: string;
    name: string;
}

export type LoginUserRequest = {
    username: string;
    password: string;
}

export type LoginResponse = {
    id: string;
    email: string;
    username: string;
    name: string;
    token: Token;
}

export function toRegisterResponse(user: User): RegisterResponse {
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email
    }
}

export function toLoginResponse(user: User, accessToken: string, refreshToken: string): LoginResponse {
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        token: {
            accessToken: accessToken,
            refreshToken: refreshToken,
        }
    }
}