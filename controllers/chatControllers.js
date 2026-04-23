const mongoose = require("mongoose");
const Message = require("../models/message");
const Connection = require("../models/connection");

const hasAcceptedConnection = async (userA, userB) => {
  const connection = await Connection.findOne({
    status: "accepted",
    $or: [
      { requester: userA, recipient: userB },
      { requester: userB, recipient: userA }
    ]
  }).select("_id");

  return Boolean(connection);
};

const getConversationMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId: otherUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id"
      });
    }

    const isConnected = await hasAcceptedConnection(currentUserId, otherUserId);
    if (!isConnected) {
      return res.status(403).json({
        success: false,
        message: "You can chat only after connection is accepted"
      });
    }

    // Opening a conversation means recipient has seen these messages.
    const now = new Date();
    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: currentUserId,
        $or: [
          { deliveredAt: null },
          { readAt: null }
        ]
      },
      {
        $set: {
          deliveredAt: now,
          readAt: now
        }
      }
    );

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .limit(300)
      .lean();

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error("Get conversation messages error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const sender = req.user.id;
    const { userId: receiver } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(receiver)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver id"
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }

    if (sender.toString() === receiver.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot message yourself"
      });
    }

    const isConnected = await hasAcceptedConnection(sender, receiver);
    if (!isConnected) {
      return res.status(403).json({
        success: false,
        message: "Connection request must be accepted before chatting"
      });
    }

    const message = await Message.create({
      sender,
      receiver,
      content: content.trim()
    });

    res.status(201).json({
      success: true,
      message: "Message sent",
      data: message
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getChatContacts = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Contacts/inbox view marks messages as delivered, but not read.
    await Message.updateMany(
      {
        receiver: currentUserId,
        deliveredAt: null
      },
      {
        $set: {
          deliveredAt: new Date()
        }
      }
    );

    const connections = await Connection.find({
      status: "accepted",
      $or: [
        { requester: currentUserId },
        { recipient: currentUserId }
      ]
    })
      .sort({ updatedAt: -1 })
      .populate("requester", "name email")
      .populate("recipient", "name email")
      .lean();

    const contacts = [];

    for (const connection of connections) {
      const isRequester = String(connection.requester?._id) === String(currentUserId);
      const otherUser = isRequester ? connection.recipient : connection.requester;

      if (!otherUser || !otherUser._id) {
        continue;
      }

      const latestMessage = await Message.findOne({
        $or: [
          { sender: currentUserId, receiver: otherUser._id },
          { sender: otherUser._id, receiver: currentUserId }
        ]
      })
        .sort({ createdAt: -1 })
        .lean();

      contacts.push({
        userId: String(otherUser._id),
        name: otherUser.name || "Unknown User",
        email: otherUser.email || "",
        lastMessage: latestMessage?.content || "No messages yet",
        lastMessageAt: latestMessage?.createdAt || connection.updatedAt
      });
    }

    res.status(200).json({
      success: true,
      contacts
    });
  } catch (error) {
    console.error("Get chat contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getConversationMessages,
  sendMessage,
  getChatContacts
};
