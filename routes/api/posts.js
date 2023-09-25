// Requiring all the modules
const express = require("express");
const User = require("../../schemas/userSchema");
const Post = require("../../schemas/postSchema");

// Creating the router that will be exported to the app
const router = express.Router();

// Route for login on GET request
router.get("/", async (req, res, next) => {
  try {
    // Getting all the posts from the database and embedding the user info
    const results = await Post.find()
      .populate("postedBy")
      .sort({ createdAt: -1 });
    return res.status(200).send(results);
  } catch (err) {
    return res.status(500).send("Could not load the posts. Try again later");
  }
});

// Route for login on POST request
router.post("/", async (req, res, next) => {
  // Returing from the funciton when there is no value for the post
  if (!req.body.content) {
    return res.sendStatus(400);
  }

  // Trying to save the post in the post collection in the database
  try {
    // Creating the object with content and postedby information
    const postData = {
      content: req.body.content,
      postedBy: req.session.user,
    };

    // Saving the new post into the database
    let newPost = await Post.create(postData);

    // populating the ObjectId to embed the info of user in the new post object
    newPost = await User.populate(newPost, { path: "postedBy" });

    return res.status(201).send(newPost);
  } catch (err) {
    res.sendStatus(400);
    return console.log("Could not post. Try later " + err.message);
  }
});

router.put("/:id/like", async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.session.user._id;

  // Checking if the user has already liked the post
  const isLiked =
    req.session.user.likes && req.session.user.likes.includes(postId);

  // Deciding the operator base of if the user has liked the post
  const option = isLiked ? "$pull" : "$addToSet";

  // Insert user likes
  try {
    req.session.user = await User.findByIdAndUpdate(
      userId,
      {
        [option]: { likes: postId },
      },
      { new: true }
    );
  } catch (err) {
    console.log(err.message);
    return res.sendStatus(400);
  }

  // Inserting in post likes
  try {
    var post = await Post.findByIdAndUpdate(
      postId,
      {
        [option]: { likes: userId },
      },
      { new: true }
    );
  } catch (err) {
    console.log(err.message);
    return res.sendStatus(400);
  }

  res.status(200).send(post);
});

// Exporting the router to the app
module.exports = router;
