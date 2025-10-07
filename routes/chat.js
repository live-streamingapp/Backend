import express from "express";
import Chat from "../model/chat.js";
import mongoose from "mongoose";

const chatRouter = express.Router();
chatRouter.get("/chat", async (req, res) => {
	const { userId, targetUserId } = req.query;
	// Validate IDs
	if (
		!userId ||
		!targetUserId ||
		!mongoose.Types.ObjectId.isValid(userId) ||
		!mongoose.Types.ObjectId.isValid(targetUserId)
	) {
		return res
			.status(400)
			.json({ message: "Invalid or missing userId/targetUserId" });
	}
	try {
		// Convert to ObjectId
		const userObjId = new mongoose.Types.ObjectId(userId);
		const targetObjId = new mongoose.Types.ObjectId(targetUserId);

		let chat = await Chat.findOne({
			participants: { $all: [userObjId, targetObjId] },
		});
		if (!chat) {
			return res.status(200).json({ messages: [] });
		}
		// Format messages for frontend
		const messages = chat.messages.map((msg) => ({
			id: msg._id,
			sender: msg.sender.equals(userObjId) ? "me" : "them",
			text: msg.message,
			time: new Date(msg.createdAt).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
		}));
		return res.status(200).json({ messages });
	} catch (err) {
		console.error("Error fetching chat:", err);
		return res.status(500).json({ message: "Server error" });
	}
});

export default chatRouter;
