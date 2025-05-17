import {AuthenticatedRequest} from "../types/user.request";
import {toUserResponse, UserResponse} from "../models/user.model";
import {prismaClient} from "../config/database";
import {ResponseError} from "../errors/response.error";


export class UserService {

    static async get(request: AuthenticatedRequest): Promise<UserResponse> {
        const userId = request.payload?.id;
        const user = await prismaClient.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
            }
        })

        if (!user) {
            throw new ResponseError(404, "User not found!");
        }

        return toUserResponse(user);
    }
}