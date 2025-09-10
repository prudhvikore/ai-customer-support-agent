import mongoose from "mongoose";
import createApp from "./server.js";
import config from "./config.js";
import logger from "./logger.js";

const app = createApp();

let server;

const start = async () => {
  try {
    // Mongo connection
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("Connected to MongoDB");

    // Start HTTP server
    server = app.listen(config.port, () =>
      logger.info(`Server listening on ${config.port}`)
    );

    // Graceful shutdown handlers
    const shutdown = async (signal) => {
      try {
        logger.info({ signal }, "Shutdown initiated");
        if (server) {
          server.close(() => logger.info("HTTP server closed"));
        }
        await mongoose.disconnect();
        logger.info("MongoDB disconnected");
        process.exit(0);
      } catch (err) {
        logger.error(err, "Error during shutdown");
        process.exit(1);
      }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("unhandledRejection", (reason) => {
      logger.error({ reason }, "Unhandled Rejection, shutting down");
      shutdown("unhandledRejection");
    });
    process.on("uncaughtException", (err) => {
      logger.error(err, "Uncaught Exception, shutting down");
      shutdown("uncaughtException");
    });
  } catch (err) {
    logger.error(err, "Startup error");
    process.exit(1);
  }
};

start();
