import { User } from "../../generated/prisma/client";

export type UserResponse = {
  id: string;
  email: string;
  username: string;
  name: string;
};

export type UpdateUserRequest = {
  name?: string;
  email?: string;
  password?: string;
};

export function toUserResponse(
  user: Pick<User, "id" | "username" | "name" | "email">,
): UserResponse {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
  };
}
