// Requiring all the modules
const mongoose = require("mongoose");

// Defining the post Schema
const PostSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pinned: Boolean,
  },
  { timestamps: true }
);

// Creating the post model
const Post = mongoose.model("Post", PostSchema);

// Exporting the Post model
module.exports = Post;
