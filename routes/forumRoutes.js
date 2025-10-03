import express from "express";
import User from "../model/UserModel.js";
import Course from "../model/CourseModel.js";
import Forum from "../model/ForumModel.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:courseId/join-forum", authMiddleware, async (req, res) => {
	try {
		const userId = req.user?._id;
		const { courseId } = req.params;
		if (!userId || !courseId) {
			return res
				.status(400)
				.json({ message: "User ID and Course ID are required." });
		}
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found." });
		if (!user.enrolledCourses.map((id) => id.toString()).includes(courseId)) {
			return res
				.status(403)
				.json({ message: "You are not enrolled in this course." });
		}
		// Find or create forum for this course
		let forum = await Forum.findOne({ courseId });
		if (!forum) {
			forum = new Forum({ courseId, messages: [] });
			await forum.save();
		}
		return res
			.status(200)
			.json({ message: "Access granted to course forum.", forumId: forum._id });
	} catch (err) {
		return res.status(500).json({ message: "Server error" });
	}
});

router.get("/:courseId/messages", authMiddleware, async (req, res) => {
	try {
		const userId = req.user?._id;
		const { courseId } = req.params;
		if (!userId || !courseId) {
			return res
				.status(400)
				.json({ message: "User ID and Course ID are required." });
		}
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found." });
		if (!user.enrolledCourses.map((id) => id.toString()).includes(courseId)) {
			return res
				.status(403)
				.json({ message: "You are not enrolled in this course." });
		}
		const forum = await Forum.findOne({ courseId }).populate(
			"messages.sender",
			"name"
		);
		if (!forum) return res.status(404).json({ message: "Forum not found." });
		return res.status(200).json({ messages: forum.messages });
	} catch (err) {
		return res.status(500).json({ message: "Server error" });
	}
});

export default router;
