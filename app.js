import "dotenv/config";
import express from "express";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { randomUUID } from "crypto";
import logger from "./utils/logger.js";
import seedMemberships from "./prisma/seed.js";
import { authRouter } from "./routes/authRouter.js";
import { checkoutRouter } from "./routes/checkoutRouter.js";
import { profileRouter } from "./routes/profileRouter.js";
import { membershipRouter } from "./routes/membershipRouter.js";
import { clubNameRouter } from "./routes/clubNameRouter.js";

const app = express();
const port = process.env.PORT;
const isProd = process.env.NODE_ENV === "production";
const appURL = process.env.APP_URL;
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : isProd
    ? []
    : appURL;
const gracefulShutdownTimeoutMs = 30000;

// Security & performance
app.use(helmet());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(compression());

//Cookie
app.use(cookieParser());

// Request ID middleware
app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
});

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// JSON syntax error handler
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }
  next(err);
});

// Logging middleware with timing and status
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    // Create variables to avoid repeating req. and res.
    const method = req.method;
    const url = req.url;
    const status = res.statusCode;

    // Only log important things
    if (status >= 500) {
      logger.error({ method, url, status, duration }, "Server error");
    } else if (status >= 400) {
      logger.warn({ method, url, status, duration }, "Client error");
    } else if (url.includes("/checkout")) {
      logger.info({ method, url, status, duration }, "Payment request");
    }
    // Silent for successful regular requests (200, 301, 304, etc.)
  });

  next();
});

// Routes
app.use("/v1/auth", authRouter);
app.use("/v1/checkout", checkoutRouter);
app.use("/v1/profile", profileRouter);
app.use("/v1/membership", membershipRouter);
app.use("/v1/club", clubNameRouter);

//Crucial for debugging
app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error({ reqId: req.id, err });

  if (isProd) {
    res.status(500).json({ error: "Internal Server Error" });
  } else {
    // Development: full details for debugging
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      type: err.name,
    });
  }
});

const server = app.listen(port, () => {
  logger.info(`Listening on port: ${port}`);
});

(async () => {
  await seedMemberships();

  const server = app.listen(port, () => {
    logger.info(`Listening on port: ${port}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    logger.info("Graceful shutdown initiated");
    server.close(() => {
      logger.info("All connections closed");
      process.exit(0);
    });
    setTimeout(() => {
      logger.error("Forced exit after timeout");
      process.exit(1);
    }, gracefulShutdownTimeoutMs);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
})();

// Unhandled rejections & exceptions
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled Rejection");
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error(err, "Uncaught Exception");
  process.exit(1);
});
