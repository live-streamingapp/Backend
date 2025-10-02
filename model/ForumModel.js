import mongoose from "mongoose";

const forumMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const forumSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, unique: true },
  messages: [forumMessageSchema]
});

const Forum = mongoose.model("Forum", forumSchema);
export default Forum;
