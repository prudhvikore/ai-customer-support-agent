import logger from "../logger.js";
import config from "../config.js";

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = err.status || 500;
  let message = err.message || "Internal Server Error";
  const details = [];

  if (err.isJoi) {
    status = 400;
    message = "Validation failed";
    if (err.details && Array.isArray(err.details)) {
      err.details.forEach((d) => details.push({ message: d.message, path: d.path }));
    }
  }

  // Mongo duplicate key errors (E11000)
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already in use`;
  }

  if (status >= 500) {
    logger.error({ err, url: req.originalUrl, method: req.method }, "server_error");
  } else {
    logger.warn({ err, url: req.originalUrl, method: req.method }, "handled_error");
  }

  const payload = { status, message };
  if (details.length) payload.details = details;

  if (config.env !== "production") {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};

export default errorHandler;
