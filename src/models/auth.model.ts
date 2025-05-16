import {User} from "../../generated/prisma/client";
import {UserResponse} from "./user.model";

export type RegisterResponse = {
    id: string;
    email: string;
    username: string;
    name: string;
}

export function toRegisterResponse(user: User): RegisterResponse {
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email
    }
}