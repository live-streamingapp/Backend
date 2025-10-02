import { Server as SocketIOServer } from "socket.io";
import crypto from "crypto";
import Chat from "../model/chat.js";
import mongoose from "mongoose";
import Forum from "../model/ForumModel.js";

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

    socket.on("joinChat", ({ userId, targetUserId }) => {
      if (!userId || !targetUserId) return;

      const roomId = createRoomId(userId, targetUserId);
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
    });

    socket.on(
      "sendMessage",
      async ({ name, userId, targetUserId, message }) => {
        if (!userId || !targetUserId || !message) return;
        // Forum (group chat) join
        socket.on("joinForum", ({ courseId }) => {
          if (!courseId) return;
          const forumRoom = `forum-${courseId}`;
          socket.join(forumRoom);
          console.log(`User joined forum room ${forumRoom}`);
        });

        socket.on(
          "sendMessage",
          async ({ name, userId, targetUserId, message }) => {
            if (
              !userId ||
              !targetUserId ||
              typeof message !== "string" ||
              !message.trim()
            )
              return;

            const roomId = createRoomId(userId, targetUserId);
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
            } catch (err) {
              console.error("Error emitting message:", err);
            }
            io.to(roomId).emit("receiveMessage", {
              name,
              message,
              timestamp: new Date(),
            });
            console.log(
              `Message from ${userId} to ${targetUserId}: ${message}`
            );
          }
        );

        // Forum (group chat) message

        socket.on(
          "sendForumMessage",
          async ({ name, userId, courseId, message }) => {
            if (
              !userId ||
              !courseId ||
              typeof message !== "string" ||
              !message.trim()
            )
              return;
            const forumRoom = `forum-${courseId}`;
            try {
              let forum = await Forum.findOne({ courseId });
              if (!forum) {
                forum = new Forum({ courseId, messages: [] });
              }
              forum.messages.push({ sender: userId, message });
              await forum.save();
            } catch (err) {
              console.error("Error emitting forum message:", err);
            }
            io.to(forumRoom).emit("receiveForumMessage", {
              name,
              message,
              timestamp: new Date(),
            });
            console.log(`Forum message in course ${courseId}: ${message}`);
          }
        );

        socket.on("disconnect", () => {
          console.log(`Socket disconnected: ${socket.id}`);
        });
      }
    );

    return io;
  });
};
