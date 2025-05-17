import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.json(),
  winston.format.errors({ stack: true }),
);

const devConsoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf((info) => {
    return `${info.timestamp} ${info.level}: ${info.message} ${info.stack || ""} ${
      Object.keys(info.metadata || {}).length ? JSON.stringify(info.metadata) : ""
    }`;
  }),
);

winston.addColors(colors);

const transports = [
  new winston.transports.Console({
    format: devConsoleFormat,
  }),
  new DailyRotateFile({
    dirname: "./logs",
    filename: "application-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
  }),
  new DailyRotateFile({
    dirname: "./logs",
    filename: "error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    level: "error",
  }),
  new winston.transports.Console({
    level: "error",
  }),
];

const logger = winston.createLogger({
  level: "info",
  levels,
  format,
  transports,
  exitOnError: false,
});

function sanitizeLog(obj: any): any {
  if (!obj) return obj;

  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (["password", "token", "secret", "authorization", "apikey"].includes(key.toLowerCase())) {
        return "[REDACTED]";
      }

      return value;
    }),
  );
}

export default {
  error: (message: string, meta: Record<string, any> = {}): void => {
    logger.error(message, { metadata: sanitizeLog(meta) });
  },
  warn: (message: string, meta: Record<string, any> = {}): void => {
    logger.warn(message, { metadata: sanitizeLog(meta) });
  },
  info: (message: string, meta: Record<string, any> = {}): void => {
    logger.info(message, { metadata: sanitizeLog(meta) });
  },
  http: (message: string, meta: Record<string, any> = {}): void => {
    logger.http(message, { metadata: sanitizeLog(meta) });
  },
  debug: (message: string, meta: Record<string, any> = {}): void => {
    logger.debug(message, { metadata: sanitizeLog(meta) });
  },
};
