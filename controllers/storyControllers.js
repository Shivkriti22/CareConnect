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


// ADD/REMOVE REACTION
const toggleReaction = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { reactionType } = req.body;
    const userId = req.user.id;

    // Validate reaction type
    const validReactions = ['helpful', 'relatable', 'insightful'];
    if (!validReactions.includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reaction type"
      });
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }

    // Initialize reactions if they don't exist
    if (!story.reactions) {
      story.reactions = {
        helpful: { count: 0, users: [] },
        relatable: { count: 0, users: [] },
        insightful: { count: 0, users: [] }
      };
    }

    const userIdString = userId.toString();
    const reactionUsers = story.reactions[reactionType].users || [];
    const userIndex = reactionUsers.findIndex(id => id.toString() === userIdString);

    if (userIndex > -1) {
      // Remove reaction
      story.reactions[reactionType].users.splice(userIndex, 1);
      story.reactions[reactionType].count = Math.max(0, story.reactions[reactionType].count - 1);
    } else {
      // Add reaction
      story.reactions[reactionType].users.push(userId);
      story.reactions[reactionType].count += 1;
    }

    await story.save();

    res.status(200).json({
      success: true,
      message: userIndex > -1 ? "Reaction removed" : "Reaction added",
      reactions: story.reactions,
      hasReacted: userIndex === -1
    });
  } catch (error) {
    console.error('Reaction error:', error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// GET REACTIONS FOR A STORY
const getReactions = async (req, res) => {
  try {
    const { storyId } = req.params;
    
    const story = await Story.findById(storyId).select('reactions');
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }

    let userReaction = null;
    if (req.user) {
      const userId = req.user.id.toString();
      for (const [reactionType, reactionData] of Object.entries(story.reactions || {})) {
        if (reactionData.users && reactionData.users.some(id => id.toString() === userId)) {
          userReaction = reactionType;
          break;
        }
      }
    }

    res.status(200).json({
      success: true,
      reactions: story.reactions,
      userReaction
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
  deleteStory,
  toggleReaction,
  getReactions
};