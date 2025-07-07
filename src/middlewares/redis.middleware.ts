import { NextFunction, Response } from "express";
import { redis } from "../config/redis.config";
import logger from "../utils/logger";
import { AuthenticatedRequest } from "../types/user.request";

export const cacheMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.payload?.id;
  if (!userId) return next();

  const key = `cache:${req.originalUrl}:${userId}`;

  try {
    const cached = await redis.get(key);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      redis.setex(key, 60 * 68, JSON.stringify(body));
      return originalJson(body);
    };

    next();
  } catch (err) {
    logger.warn("Redis error in middleware");
    next();
  }
};
