const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getConversationMessages,
  sendMessage,
  getChatContacts
} = require("../controllers/chatControllers");

router.get("/contacts", authMiddleware, getChatContacts);
router.get("/:userId/messages", authMiddleware, getConversationMessages);
router.post("/:userId/messages", authMiddleware, sendMessage);

module.exports = router;
