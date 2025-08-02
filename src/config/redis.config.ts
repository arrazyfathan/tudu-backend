// Redis implementation temporarily disabled
// import Redis from "ioredis";
import logger from "../utils/logger";

// Mock Redis client for temporary disabling
export const redis = {
  get: async () => null,
  setex: async () => null,
  on: () => null,
};

// Original Redis implementation:
/*
export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  db: Number(process.env.REDIS_DB) || 0,
  socketTimeout: 10000,
  maxRetriesPerRequest: 0,
  retryStrategy: (times) => {
    if (times >= 3) return null;
    return Math.min(times * 100, 3000);
  },
});

redis.on("error", (err) => {
  logger.error("Redis connection error:", err);
});

redis.on("connect", () => {
  logger.info("Connected to Redis");
});

redis.on("ready", () => {
  logger.info("Redis is ready");
});
*/
