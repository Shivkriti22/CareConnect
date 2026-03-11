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



// GET MY STORIES (FOR LOGGED-IN USER)

const getMyStories = async (req, res) => {

  try {

    const stories = await Story.find({ user: req.user.id }).sort({ createdAt: -1 });

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



// GET STORY BY ID

const getStoryById = async (req, res) => {

  try {

    const story = await Story.findById(req.params.id);

    if (!story) {

      return res.status(404).json({
        success: false,
        message: "Story not found"
      });

    }

    res.status(200).json({
      success: true,
      story
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};




// UPDATE STORY
const updateStory = async (req, res) => {
  try {
    const { title, body, authorName, diseaseType } = req.body;

    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }

    // only allow owner to update
    if (story.user && story.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // update fields if provided
    if (title !== undefined) story.title = title;
    if (body !== undefined) story.body = body;
    if (authorName !== undefined) story.authorName = authorName;
    if (diseaseType !== undefined) story.diseaseType = diseaseType;

    await story.save();

    res.status(200).json({
      success: true,
      story
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// DELETE STORY
const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }

    if (story.user && story.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    await story.deleteOne();

    res.status(200).json({
      success: true,
      message: "Story deleted"
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
  getFeaturedStories,
  getMyStories,
  getStoryById,
  updateStory,
  deleteStory
};