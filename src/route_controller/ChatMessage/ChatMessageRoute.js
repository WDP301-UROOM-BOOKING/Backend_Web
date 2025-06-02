const express = require('express');
const router = express.Router();
const checkUser = require('../../middlewares/checkUser');

const { getChatHistory, getChatHistoryByUser, getAllChatUsers } = require('./ChatMessageController');

// Route: GET /chat/:userA/:userB
router.get('/chat-history/:userB',checkUser, getChatHistory);
router.get('/chat-users',checkUser ,getAllChatUsers);

module.exports = router;
