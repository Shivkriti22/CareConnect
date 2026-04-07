const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true,
    trim: true
  },

  body: {
    type: String,
    required: true
  },

  authorName: {
    type: String,
    required: true
  },

  diseaseType: {
    type: String,
    required: true
  },

  featured: {
    type: Boolean,
    default: false
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  reactions: {
    helpful: {
      count: {
        type: Number,
        default: 0
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      ]
    },
    relatable: {
      count: {
        type: Number,
        default: 0
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      ]
    },
    insightful: {
      count: {
        type: Number,
        default: 0
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      ]
    }
  }

},
{
  timestamps: true
}
);

module.exports = mongoose.model("Story", storySchema);