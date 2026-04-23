const mongoose = require("mongoose");
const Connection = require("../models/connection");
const User = require("../models/user");

const findConnectionBetweenUsers = (userA, userB) => {
  return Connection.findOne({
    $or: [
      { requester: userA, recipient: userB },
      { requester: userB, recipient: userA }
    ]
  });
};

const getConnectionStatus = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    if (String(currentUserId) === String(userId)) {
      return res.status(200).json({
        success: true,
        status: "self"
      });
    }

    const connection = await findConnectionBetweenUsers(currentUserId, userId);

    if (!connection) {
      return res.status(200).json({
        success: true,
        status: "not_connected"
      });
    }

    if (connection.status === "accepted") {
      return res.status(200).json({
        success: true,
        status: "connected",
        requestId: connection._id
      });
    }

    if (connection.status === "pending") {
      const isRequester = String(connection.requester) === String(currentUserId);

      return res.status(200).json({
        success: true,
        status: isRequester ? "pending_sent" : "pending_received",
        requestId: connection._id
      });
    }

    return res.status(200).json({
      success: true,
      status: "not_connected",
      requestId: connection._id
    });
  } catch (error) {
    console.error("Get connection status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const sendConnectionRequest = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { userId: recipientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    if (String(requesterId) === String(recipientId)) {
      return res.status(400).json({ success: false, message: "You cannot connect with yourself" });
    }

    const recipientExists = await User.findById(recipientId).select("_id");
    if (!recipientExists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existing = await findConnectionBetweenUsers(requesterId, recipientId);

    if (!existing) {
      const newRequest = await Connection.create({
        requester: requesterId,
        recipient: recipientId,
        status: "pending"
      });

      return res.status(201).json({
        success: true,
        message: "Connection request sent",
        status: "pending_sent",
        requestId: newRequest._id
      });
    }

    if (existing.status === "accepted") {
      return res.status(200).json({
        success: true,
        message: "Already connected",
        status: "connected",
        requestId: existing._id
      });
    }

    if (existing.status === "pending") {
      const isRequester = String(existing.requester) === String(requesterId);
      return res.status(200).json({
        success: true,
        message: isRequester ? "Request already sent" : "User has sent you a request",
        status: isRequester ? "pending_sent" : "pending_received",
        requestId: existing._id
      });
    }

    existing.requester = requesterId;
    existing.recipient = recipientId;
    existing.status = "pending";
    await existing.save();

    return res.status(200).json({
      success: true,
      message: "Connection request sent",
      status: "pending_sent",
      requestId: existing._id
    });
  } catch (error) {
    console.error("Send connection request error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getReceivedRequests = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const requests = await Connection.find({
      recipient: currentUserId,
      status: "pending"
    })
      .sort({ createdAt: -1 })
      .populate("requester", "name email")
      .lean();

    const items = requests.map((request) => ({
      requestId: request._id,
      userId: request.requester?._id,
      name: request.requester?.name || "Unknown User",
      email: request.requester?.email || "",
      createdAt: request.createdAt
    }));

    res.status(200).json({
      success: true,
      requests: items
    });
  } catch (error) {
    console.error("Get received requests error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const respondToRequest = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { requestId } = req.params;
    const { action } = req.body;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: "Invalid request id" });
    }

    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    const request = await Connection.findOne({
      _id: requestId,
      recipient: currentUserId,
      status: "pending"
    });

    if (!request) {
      return res.status(404).json({ success: false, message: "Pending request not found" });
    }

    request.status = action === "accept" ? "accepted" : "declined";
    await request.save();

    res.status(200).json({
      success: true,
      message: action === "accept" ? "Request accepted" : "Request declined",
      status: request.status,
      requestId: request._id
    });
  } catch (error) {
    console.error("Respond to request error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getConnectionStatus,
  sendConnectionRequest,
  getReceivedRequests,
  respondToRequest
};
