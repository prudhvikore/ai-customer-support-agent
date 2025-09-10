import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";

import config from "./config.js";
import logger from "./logger.js";

import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import errorHandler from "./middlewares/errorHandler.js";

export default function createApp() {
  const app = express();

  app.use(pinoHttp({ logger }));

  app.use(cors({
    origin: [
      "http://localhost:5173",
      "https://unique-hotteok-c74ae7.netlify.app"
    ],
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // rate limiter
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
  });
  app.use(limiter);

  // routes
  app.use("/auth", authRoutes);
  app.use("/chat", chatRoutes);

  // health-check
  app.get("/", (req, res) => res.json({ ok: true }));

  app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  app.use(errorHandler);

  return app;
}
