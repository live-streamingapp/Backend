import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

// Message subdocument schema
const messageSchema = new Schema(
  {
    sender: { type: Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    // Add createdAt for timestamp
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// Chat schema
const chatSchema = new Schema(
  {
    participants: [{ type: Types.ObjectId, ref: "User", required: true }],
    messages: [messageSchema],
  },
  { timestamps: true }
);

// Export model
const Chat = model("Chat", chatSchema);
export default Chat;
