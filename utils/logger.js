// utils/logger.js
import pino from "pino";

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level: isProduction ? "info" : "debug",

  ...(isDevelopment && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  }),

  ...(isProduction && {
    base: {
      environment: "production",
    },
  }),
});

export default logger;
