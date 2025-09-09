import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import config from "./config.js";

const app = express();
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
});
app.use(limiter);

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);

app.get("/", (req, res) => res.json({ ok: true }));

const start = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB");
    app.listen(config.port, () =>
      console.log(`Server listening on ${config.port}`)
    );
  } catch (err) {
    console.error("Startup error", err);
  }
};

start();
