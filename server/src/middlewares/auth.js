import jwt from "jsonwebtoken";
import logger from "../logger.js";
import config from "../config.js";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      const err = new Error("Authentication token missing");
      err.status = 401;
      throw err;
    }

    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload; // token payload -> { sub, username, email }
    return next();
  } catch (error) {
    logger.warn({ err: error }, "auth.middleware_error");
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      error.status = 401;
      error.message = "Invalid or expired token";
    }
    return next(error);
  }
};

export default authMiddleware;
