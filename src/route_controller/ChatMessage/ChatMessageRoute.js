const express = require('express');
const router = express.Router();

const { getChatHistory, getChatHistoryByUser, getAllChatUsers } = require('./ChatMessageController');
const checkRole = require('../../middlewares/checkRole');

// Route: GET /chat/:userA/:userB
router.get('/chat-history/:userB', checkRole(["CUSTOMER", "OWNER", "ADMIN"]), getChatHistory);
router.get('/chat-users', checkRole(["CUSTOMER", "OWNER", "ADMIN"]), getAllChatUsers);

module.exports = router;
