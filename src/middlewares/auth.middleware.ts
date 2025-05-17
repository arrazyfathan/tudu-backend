import { Response, NextFunction } from "express";
import { errorResponse } from "../utils/response";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, JwtPayload } from "../types/user.request";

const JWT_SECRET = process.env.JWT_ACCESS_SECRET;

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(403).json(errorResponse("Missing or invalid authorization token"));
    return;
  }

  if (!JWT_SECRET) {
    res.status(500).json(errorResponse("JWT secret is not configured"));
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.payload = decoded;
    next();
    return;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json(errorResponse("Access token has expired"));
      return;
    }
    res.status(401).json(errorResponse("Unauthorized"));
  }
};
