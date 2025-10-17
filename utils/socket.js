import { Server as SocketIOServer } from "socket.io";
import crypto from "crypto";
import Chat from "../model/chat.js";
import mongoose from "mongoose";
import Forum from "../model/ForumModel.js";
import CourseSession from "../model/CourseSessionModel.js";

const createRoomId = (userId1, userId2) => {
	const [a, b] = [userId1, userId2].sort();
	const raw = `${a}--vs--${b}`;
	const hash = crypto.createHash("sha256").update(raw).digest("hex");
	return `room-${hash.slice(0, 16)}`;
};

export const initializeSocket = (server) => {
	const io = new SocketIOServer(server, {
		cors: {
			origin: ["http://localhost:5173", process.env.CLIENT_URL],
			credentials: true,
			methods: ["GET", "POST", "PUT", "DELETE"],
		},
	});

	io.on("connection", (socket) => {
		console.log(`Socket connected: ${socket.id}`);

		// Join one-on-one chat room
		socket.on("joinChat", ({ userId, targetUserId }) => {
			if (!userId || !targetUserId) {
				console.log("❌ joinChat failed - missing data:", {
					userId,
					targetUserId,
				});
				return;
			}

			const roomId = createRoomId(userId, targetUserId);

			// Leave all other chat rooms first to avoid conflicts
			Array.from(socket.rooms).forEach((room) => {
				if (room.startsWith("room-") && room !== roomId) {
					socket.leave(room);
					console.log(`⬅️ Left old chat room: ${room}`);
				}
			});

			socket.join(roomId);
			console.log(
				`✅ User ${userId} joined chat room ${roomId} (with ${targetUserId})`
			);

			// Log all users currently in this room
			const room = io.sockets.adapter.rooms.get(roomId);
			console.log(`   Room ${roomId} now has ${room?.size || 0} user(s)`);
		});

		// Send message in one-on-one chat
		socket.on(
			"sendMessage",
			async ({ name, userId, targetUserId, message, tempId }) => {
				if (
					!userId ||
					!targetUserId ||
					typeof message !== "string" ||
					!message.trim()
				) {
					console.log("❌ sendMessage failed - invalid data:", {
						userId,
						targetUserId,
						hasMessage: !!message?.trim(),
					});
					socket.emit("messageError", {
						error: "Invalid message data",
						originalMessage: message,
					});
					return;
				}

				const roomId = createRoomId(userId, targetUserId);
				console.log(
					`📨 Processing message from ${userId} to ${targetUserId} in room ${roomId}`
				);

				try {
					const userObjId = new mongoose.Types.ObjectId(userId);
					const targetObjId = new mongoose.Types.ObjectId(targetUserId);

					let chat = await Chat.findOne({
						participants: { $all: [userObjId, targetObjId] },
					});
					if (!chat) {
						chat = new Chat({
							participants: [userObjId, targetObjId],
							messages: [],
						});
					}
					chat.messages.push({ sender: userObjId, message });
					await chat.save();

					const messageData = {
						name,
						senderId: userId,
						message,
						timestamp: new Date(),
						tempId,
					};

					// Check how many users are in the room
					const room = io.sockets.adapter.rooms.get(roomId);
					console.log(
						`   Room ${roomId} has ${
							room?.size || 0
						} user(s) - broadcasting message`
					);

					// Broadcast to everyone in the room INCLUDING sender
					// Frontend will filter based on senderId
					io.to(roomId).emit("receiveMessage", messageData);

					// Send confirmation back to sender that message was saved
					socket.emit("messageSaved", {
						tempId: tempId,
						savedMessage: messageData,
					});

					console.log(
						`✅ Message broadcast complete: "${message.substring(0, 50)}..."`
					);
				} catch (err) {
					console.error("❌ Error sending message:", err);
					// Emit error back to sender if save fails
					socket.emit("messageError", {
						error: "Failed to send message",
						originalMessage: message,
					});
				}
			}
		);

		// Join forum (group chat) room
		socket.on("joinForum", ({ userId, courseId }) => {
			if (!courseId) {
				console.log("❌ joinForum failed - missing courseId");
				return;
			}

			// Leave all other forum rooms first to avoid conflicts
			Array.from(socket.rooms).forEach((room) => {
				if (room.startsWith("forum-") && room !== `forum-${courseId}`) {
					socket.leave(room);
					console.log(`⬅️ Left old forum room: ${room}`);
				}
			});

			const forumRoom = `forum-${courseId}`;
			socket.join(forumRoom);
			console.log(`✅ User ${userId} joined forum room ${forumRoom}`);
		});

		// Send message in forum (group chat)
		socket.on(
			"sendForumMessage",
			async ({ name, userId, courseId, message, tempId }) => {
				if (
					!userId ||
					!courseId ||
					typeof message !== "string" ||
					!message.trim()
				) {
					console.log("❌ sendForumMessage failed - invalid data:", {
						userId,
						courseId,
						hasMessage: !!message?.trim(),
					});
					socket.emit("messageError", {
						error: "Invalid forum message data",
						originalMessage: message,
					});
					return;
				}

				const forumRoom = `forum-${courseId}`;
				console.log(
					`📨 Processing forum message from ${userId} in course ${courseId}`
				);

				try {
					let forum = await Forum.findOne({ courseId });
					if (!forum) {
						forum = new Forum({ courseId, messages: [] });
					}
					forum.messages.push({ sender: userId, message });
					await forum.save();

					const messageData = {
						name,
						userId,
						message,
						timestamp: new Date(),
						tempId,
					};

					// Broadcast to everyone in the forum INCLUDING sender
					// Frontend will handle deduplication
					io.to(forumRoom).emit("receiveForumMessage", messageData);

					// Send confirmation back to sender that message was saved
					socket.emit("forumMessageSaved", {
						tempId: tempId,
						savedMessage: messageData,
					});

					console.log(
						`✅ Forum message broadcast complete: "${message.substring(
							0,
							50
						)}..."`
					);
				} catch (err) {
					console.error("❌ Error sending forum message:", err);
					// Emit error back to sender if save fails
					socket.emit("messageError", {
						error: "Failed to send forum message",
						originalMessage: message,
					});
				}
			}
		);

		// Handle disconnect
		socket.on("disconnect", () => {
			console.log(`Socket disconnected: ${socket.id}`);
		});
	});

	return io;
};
