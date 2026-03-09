const Story = require("../models/story");


// CREATE STORY
const createStory = async (req, res) => {

  try {

    const { title, body, authorName, diseaseType } = req.body;

    const story = new Story({
      title,
      body,
      authorName,
      diseaseType,
      user: req.user.id
    });

    await story.save();

    res.status(201).json({
      success: true,
      message: "Story shared successfully",
      story
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};



// GET ALL STORIES
const getAllStories = async (req, res) => {

  try {

    const stories = await Story.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      stories
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};



// GET FEATURED STORIES (FOR HOMEPAGE)

const getFeaturedStories = async (req, res) => {

  try {

    const stories = await Story.find({ featured: true }).limit(3);

    res.status(200).json({
      success: true,
      stories
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};



module.exports = {
  createStory,
  getAllStories,
  getFeaturedStories
};