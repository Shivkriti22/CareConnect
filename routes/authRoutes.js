const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  updateProfile
} = require("../controllers/authControllers");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.put("/update-profile", authMiddleware, updateProfile);

module.exports = router;