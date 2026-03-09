const express = require("express");
const router = express.Router();

const {
  createStory,
  getAllStories,
  getFeaturedStories
} = require("../controllers/storyControllers");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createStory);

router.get("/", getAllStories);

router.get("/featured", getFeaturedStories);

module.exports = router;