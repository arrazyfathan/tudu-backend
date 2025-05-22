import { PrismaClient } from "../../generated/prisma";
import logger from "../utils/logger";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });

export const prismaClient = new PrismaClient({
  adapter: adapter,
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

prismaClient.$on("error", (e: any) => {
  logger.error("Prisma error", {
    message: e.message,
    target: e.target,
  });
});

prismaClient.$on("info", (e: any) => {
  logger.info("Prisma info", {
    message: e.message,
  });
});

prismaClient.$on("warn", (e: any) => {
  logger.warn("Prisma warning", {
    message: e.message,
  });
});

prismaClient.$on("query", (e: any) => {
  logger.info("Prisma query", {
    message: e,
    //params: e.params,
    //query: e.query,
    //duration: `${e.duration}ms`,
  });
});
