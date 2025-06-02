const mongoose = require("mongoose");
const ChatMessage = require("../../models/chatMessage");
const User = require("../../models/user");

exports.getChatHistory = async (req, res) => {
  const { userB } = req.params;
  const userA = req.user._id;
  let senderId, receiverId;
  try {
    senderId = userA;
    receiverId = userB;
  } catch (err) {
    return res.status(400).json({ error: "ID không hợp lệ" });
  }

  try {
    const messages = await ChatMessage.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .sort({ timestamp: 1 })
      .lean();

    return res.status(200).json(messages);
  } catch (err) {
    console.error("Lỗi khi lấy lịch sử chat:", err);
    return res.status(500).json({ error: "Lỗi khi lấy lịch sử chat" });
  }
};

exports.getChatHistoryByUser = async (req, res) => {
  const { userId } = req.params;
  console.log("Lấy lịch sử chat cho user:", userId);

  try {
    const messages = await ChatMessage.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .sort({ timestamp: 1 })
      .lean();

    return res.status(200).json(messages);
  } catch (err) {
    console.error("Lỗi khi lấy lịch sử chat:", err);
    return res.status(500).json({ error: "Lỗi khi lấy lịch sử chat" });
  }
};

const getChatUsers = async (userId) => {
  try {
    const userIdNum = Number(userId);

    const chatPartners = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { senderId: userIdNum },
            { receiverId: userIdNum }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $project: {
          message: 1,
          timestamp: 1,
          isRead: 1,
          senderId: 1,
          otherUser: {
            $cond: {
              if: { $eq: ["$senderId", userIdNum] },
              then: "$receiverId",
              else: "$senderId"
            }
          }
        }
      },
      {
        $group: {
          _id: "$otherUser",
          lastMessageAt: { $first: "$timestamp" },
          lastMessage: { $first: "$message" },
          lastMessageIsRead: { $first: "$isRead" },
          lastMessageSenderId: { $first: "$senderId" } // Store who sent the last message
        }
      },
      {
        $sort: { lastMessageAt: -1 } // << đây là chỗ sắp xếp user có tin nhắn gần nhất lên đầu
      }
    ]);

    const userIds = chatPartners.map(p => p._id);

    const users = await User.find(
      { _id: { $in: userIds } },
      { name: 1, email: 1, image: 1, status: 1, role: 1}
    ).lean().populate("ownedHotels");

    const usersWithMessages = chatPartners.map(partner => {
      const user = users.find(u => u._id.toString() === partner._id.toString());
      return {
        ...user,
        lastMessage: partner.lastMessage,
        lastMessageAt: partner.lastMessageAt,
        lastMessageIsRead: partner.lastMessageIsRead,
        isLastMessageFromMe: partner.lastMessageSenderId === userIdNum
      };
    });

    return usersWithMessages;
  } catch (error) {
    console.error('Error fetching chat users:', error);
    throw error;
  }
};

// Express route handler
exports.getAllChatUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const chatUsers = await getChatUsers(userId);
    res.status(200).json({
      status: "success",
      results: chatUsers.length,
      data: {
        users: chatUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
