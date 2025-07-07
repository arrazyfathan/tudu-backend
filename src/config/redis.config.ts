import Redis from "ioredis";
import logger from "../utils/logger";

export const redis = new Redis({
  host: "localhost",
  port: 6379,
  db: 0,
  socketTimeout: 10000,
  maxRetriesPerRequest: 0, // avoid retry flood
  retryStrategy: (times) => {
    if (times >= 3) return null; // stop retrying after 3 attempts
    return Math.min(times * 100, 3000); // exponential backoff up to 3s
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
