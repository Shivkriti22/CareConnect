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
  }

},
{
  timestamps: true
}
);

module.exports = mongoose.model("Story", storySchema);