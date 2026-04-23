const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getConnectionStatus,
  sendConnectionRequest,
  getReceivedRequests,
  respondToRequest
} = require("../controllers/connectionControllers");

router.get("/requests/received", authMiddleware, getReceivedRequests);
router.patch("/requests/:requestId", authMiddleware, respondToRequest);
router.get("/:userId/status", authMiddleware, getConnectionStatus);
router.post("/:userId/request", authMiddleware, sendConnectionRequest);

module.exports = router;
