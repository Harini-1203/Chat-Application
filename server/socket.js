import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import Message from "./models/Message.js";
import Conversation from "./models/Conversation.js";

let io;
export const onlineUsers = {};

export default function attachSocket(server) {
  io = new Server(server, { cors: { origin: "*" } });

  // 🔐 Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = user.id;
      next();
    } catch {
      next(new Error("unauth"));
    }
  });

  // 🚀 On new socket connection
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.userId);
    onlineUsers[socket.userId] = socket.id;
    socket.join(socket.userId);

    /* ---------------- TYPING EVENTS ---------------- */
    socket.on("typing:start", (payload) => {
      socket.to(payload.to).emit("typing:start", { from: socket.userId });
    });
    socket.on("typing:stop", (payload) => {
      socket.to(payload.to).emit("typing:stop", { from: socket.userId });
    });

    /* ---------------- MESSAGE SEND ---------------- */
    socket.on("message:send", async (payload) => {
      try {
        // 1️⃣ Create message document
        const msg = await Message.create({
          conversation: payload.conversation,
          sender: socket.userId,
          text: payload.text,
          delivered: true,
          deliveredAt: new Date(),
        });

        // 2️⃣ Update conversation.lastMessage with message._id
        await Conversation.findByIdAndUpdate(payload.conversation, {
          lastMessage: msg._id,
          updatedAt: new Date(),
        });

        // 3️⃣ Populate sender details
        const populatedMsg = await Message.findById(msg._id).populate(
          "sender",
          "name email"
        );

        // 4️⃣ Send message to receiver only
        io.to(payload.to).emit("message:new", populatedMsg);

        // 5️⃣ Confirm delivery back to sender
        socket.emit("message:delivered", { messageId: msg._id });
      } catch (error) {
        console.error("Error saving message in socket:", error);
        socket.emit("message:error", { error: "Failed to send message" });
      }
    });

    /* ---------------- MESSAGE READ ---------------- */
    socket.on("message:read", async (payload) => {
      try {
        await Message.updateMany(
          { conversation: payload.conversation, sender: payload.sender },
          { read: true, readAt: new Date() }
        );
        io.to(payload.sender).emit("message:read", {
          conversation: payload.conversation,
        });
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    });

    /* ---------------- DISCONNECT ---------------- */
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.userId);
      delete onlineUsers[socket.userId];
    });
  });
}
