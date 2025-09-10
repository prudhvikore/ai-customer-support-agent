import express from "express";
import Joi from "joi";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import logger from "../logger.js";
import validate from "../middlewares/validate.js";
import User from "../models/User.js";
import config from "../config.js";
import auth from "../middlewares/auth.js"

const router = express.Router();

/**
 * Joi schemas
 */
const registerSchema = Joi.object({
  body: Joi.object({
    username: Joi.string()
      .pattern(/^[a-zA-Z0-9_]+$/)
      .min(3)
      .max(30)
      .required()
      .messages({
        "string.pattern.base":
          "Username may only contain letters, numbers, and underscores",
      }),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required().messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password must not exceed 128 characters",
    }),
  }),
});

const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

const createToken = (user) => {
  const payload = { sub: user._id, username: user.username, email: user.email };
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiry || "7d",
  });
};

/**
 * POST /auth/register
 */
router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ username, email, passwordHash });
    const token = createToken(user);

    logger.info(
      { userId: user._id, email: user.email },
      "user.registered_and_logged_in"
    );
    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (err) {
    if (err.code === 11000) {
      err.status = 409;
      if (err.keyPattern.email) err.message = "Email already in use";
      else if (err.keyPattern.username) err.message = "Username already in use";
    }
    next(err);
  }
});

/**
 * POST /auth/login
 */
router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      throw err;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      throw err;
    }

    const token = createToken(user);

    logger.info({ userId: user._id }, "user.logged_in");
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /auth/me
 */
router.get("/me", auth, (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { sub: id, username, email } = req.user;
  res.json({ id, username, email });
});

export default router;
