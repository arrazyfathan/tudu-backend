import {Request} from "express";

export interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  payload?: JwtPayload;
}