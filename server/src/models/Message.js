import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    chatId: { type: String, required: true },
    chatName: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);
