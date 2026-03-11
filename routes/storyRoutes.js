const express = require("express");
const router = express.Router();

const {
  createStory,
  getAllStories,
  getFeaturedStories,
  getMyStories,
  getStoryById,
  updateStory,
  deleteStory
} = require("../controllers/storyControllers");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createStory);

router.get("/", getAllStories);

router.get("/featured", getFeaturedStories);

router.get("/my-stories", authMiddleware, getMyStories);


router.put("/:id", authMiddleware, updateStory);
router.delete("/:id", authMiddleware, deleteStory);
router.get("/:id", getStoryById);

module.exports = router;