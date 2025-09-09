import express from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import Message from "../models/Message.js";
import User from "../models/User.js";
import config from "../config.js";

const router = express.Router();

// auth middleware
const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });
  const token = header.split(" ")[1];
  try {
    const data = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(data.id);
    if (!user) return res.status(402).json({ error: "Invalid token" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// send message -> call OpenRouter -> save both user message and assistant reply
router.post("/send", auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Missing message" });

    // save user message
    const userMsg = new Message({
      user: req.user._id,
      role: "user",
      content: message,
    });
    await userMsg.save();

    // build OpenRouter request
    const payload = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful customer support assistant.",
        },
        // optionally load last N messages for context
        { role: "user", content: message },
      ],
    };

    const orRes = await axios.post(
      "https://openrouter.ai/v1/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${config.openrouterApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    // Extract assistant reply — adjust based on actual OpenRouter response shape
    const assistantText =
      (orRes.data?.choices && orRes.data.choices[0]?.message?.content) ||
      orRes.data?.output ||
      JSON.stringify(orRes.data);

    // save assistant message
    const assistantMsg = new Message({
      user: req.user._id,
      role: "assistant",
      content: assistantText,
    });
    await assistantMsg.save();

    res.json({ reply: assistantText });
  } catch (err) {
    console.error("chat/send error", err?.response?.data || err.message || err);
    res
      .status(500)
      .json({ error: "AI error", details: err?.response?.data || err.message });
  }
});

// history
router.get("/history", auth, async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user._id })
      .sort({ createdAt: 1 })
      .lean();
    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
