// socketHandlers.js
const ChatMessage = require("../../models/chatMessage");

module.exports = function (io, socket, users) {

  console.log("🔌 users:", users);
  
  // --- 1. Đăng ký user khi kết nối ---
  socket.on("register", (userId) => {
    users.set(userId, socket.id);
    console.log(`🟢 User ${userId} registered with socket ${socket.id}`);
  });

  // --- 2. Vào room khi chọn user ---
  socket.on("join-room", ({ userId, partnerId }) => {
    const roomId = getRoomId(userId, partnerId);
    console.log(
      `🔵 User ${userId} joining room ${roomId} with partner ${partnerId}`
    );
    socket.join(roomId);
    console.log(`👥 User ${userId} joined room ${roomId}`);
  });

  // --- 3. Gửi tin nhắn ---
  socket.on("send-message", async ({ senderId, receiverId, message }) => {
    console.log(
      `📩 User ${senderId} sending message to ${receiverId}: ${message}`
    );
    const roomId = getRoomId(senderId, receiverId);

    const newMsg = new ChatMessage({ senderId, receiverId, message });
    await newMsg.save();

    const msgPayload = {
      _id: newMsg._id,
      senderId,
      receiverId,
      message,
      timestamp: newMsg.timestamp,
    };

    const receiverSocketId = users.get(receiverId);

    if (receiverSocketId) {
      // Kiểm tra xem receiver đã vào room chưa
      const socketsInRoom = await io.in(roomId).allSockets(); // Trả về Set các socketId trong room
      if (socketsInRoom.has(receiverSocketId)) {
        // Nếu receiver đã ở trong room, gửi tin nhắn qua room
        io.to(roomId).emit("receive-message", msgPayload);
      } else {
        // Nếu receiver chưa ở trong room, gửi trực tiếp tin nhắn và yêu cầu join room
        io.to(receiverSocketId).emit("receive-message", msgPayload);
        io.to(receiverSocketId).emit("force-join-room", {
          roomId,
          partnerId: senderId,
        });
      }
    } else {
      // Nếu receiver không online, có thể gửi tin nhắn qua room hoặc bỏ qua (tuỳ app)
      io.to(roomId).emit("receive-message", msgPayload);
    }
  });

  // --- 4. Đánh dấu tin nhắn đã đọc ---
  socket.on("markAsRead", async ({ senderId, receiverId }) => {
    const roomId = getRoomId(senderId, receiverId);

    await ChatMessage.updateMany(
      { senderId, receiverId, isRead: false },
      { $set: { isRead: true } }
    );

    io.to(roomId).emit("receive-markAsRead", {
      senderId: receiverId,
      receiverId: senderId,
    });
  });

  // --- 5. Dọn dẹp khi disconnect ---
  socket.on("disconnect", () => {
    for (const [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
        console.log(`🔴 User ${userId} disconnected`);
        break;
      }
    }
  });
};

// --- Helper function để tạo room ID ---
function getRoomId(userId1, userId2) {
  return [userId1, userId2].sort().join("_");
}
