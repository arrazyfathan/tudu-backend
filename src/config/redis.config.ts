import Redis from "ioredis";
import logger from "../utils/logger";

export const redis = new Redis({
  host: "localhost",
  port: 6379,
  db: 0,
  socketTimeout: 10000,
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
