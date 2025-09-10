import express from "express";
import axios from "axios";
import Joi from "joi";
import config from "../config.js";

import logger from "../logger.js";
import auth from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";

import Message from "../models/Message.js";

const router = express.Router();

const sendMessageSchema = Joi.object({
  body: Joi.object({
    message: Joi.string().min(1).max(2000).required(),
    chatId: Joi.string().required(),
    chatName:Joi.string().required(),
    role: Joi.string().valid("user", "assistant").default("user"),
  }),
});

const listMessagesSchema = Joi.object({
  body: Joi.object({
    chatId: Joi.string().required(),
    limit: Joi.number().integer().min(1).max(100).default(50),
  }),
});

/**
 * POST /chat/message
 * Stores a new message
 * Returns the assistant message
 */
router.post(
  "/send",
  auth,
  validate(sendMessageSchema),
  async (req, res, next) => {
    try {
      const { sub: userId } = req.user;
      const { message, chatId, chatName } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Missing message" });
      }

      if (!chatId) {
        return res.status(400).json({ error: "chatId is required" });
      }

      const userMsg = await Message.create({
        user: userId,
        chatId,
        chatName,
        role: "user",
        content: message,
      });

      logger.info({ userId, msgId: userMsg._id }, "chat.user_message_saved");

      const payload = {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful customer support assistant.",
          },
          { role: "user", content: message },
        ],
      };

      const orRes = await axios.post(config.openrouterApi, payload, {
        headers: {
          Authorization: `Bearer ${config.openrouterApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      });

      const assistantText =
        (orRes.data?.choices && orRes.data.choices[0]?.message?.content) ||
        orRes.data?.output ||
        JSON.stringify(orRes.data);

      const assistantMsg = await Message.create({
        user: userId,
        chatId,
        chatName,
        role: "assistant",
        content: assistantText,
      });

      logger.info(
        { userId, msgId: assistantMsg._id },
        "chat.assistant_message_saved"
      );

      res.json({ reply: assistantText });
    } catch (err) {
      logger.error(
        { err: err?.response?.data || err.message, stack: err.stack },
        "chat.send_failed"
      );
      next(err);
    }
  }
);

/**
 * GET /chat/messages
 * Fetches last N messages of the authenticated user
 */
router.post(
  "/messages",
  auth,
  validate(listMessagesSchema),
  async (req, res, next) => {
    try {
      const { sub: userId } = req.user;
      const { chatId, limit } = req.body;

      if (!chatId) {
        return res.status(400).json({ error: "chatId is required" });
      }

      const messages = await Message.find({ user: userId, chatId })
        .sort({ createdAt: -1 })
        .limit(limit || 50)
        .lean();

      res.json({ chatId, messages });
      console.log(mesages)
    } catch (err) {
      next(err);
    }
  }
);

export default router;
