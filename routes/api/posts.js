// Requiring all the modules
const express = require("express");
const User = require("../../schemas/userSchema");
const Post = require("../../schemas/postSchema");

// Creating the router that will be exported to the app
const router = express.Router();

// Route for getting all the posts
router.get("/", async (req, res, next) => {
  const results = await getPosts({});
  return res.status(200).send(results);
});

// Route for getting the post data based on its id
router.get("/:id", async (req, res, next) => {
  const postId = req.params.id;
  let postData = await getPosts({ _id: postId });
  postData = postData[0];

  const results = {
    postData,
  };

  if (postData.replyTo !== undefined) {
    results.replyTo = postData.replyTo;
  }

  results.replies = await getPosts({ replyTo: postId });

  return res.status(200).send(results);
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

    if (req.body.replyTo) {
      postData.replyTo = req.body.replyTo;
    }

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

// Route for liking the post
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

// Route for retweeting the post
router.post("/:id/retweet", async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.session.user._id;
  let deletedPost;

  // Try and delete retweet
  try {
    deletedPost = await Post.findOneAndDelete({
      postedBy: userId,
      retweetData: postId,
    });
  } catch (err) {
    res.sendStatus(400);
    return console.log(err.message);
  }

  // Deciding the operator base of if the user has already retweeted the post
  const option = deletedPost != null ? "$pull" : "$addToSet";

  let repost = deletedPost;

  // Creating the retweet post
  if (repost === null) {
    try {
      repost = await Post.create({ postedBy: userId, retweetData: postId });
    } catch (err) {
      res.sendStatus(400);
      return console.log(err.message);
    }
  }

  // Insert user retweet
  try {
    req.session.user = await User.findByIdAndUpdate(
      userId,
      {
        [option]: { retweets: repost._id },
      },
      { new: true }
    );
  } catch (err) {
    console.log(err.message);
    return res.sendStatus(400);
  }

  // Inserting in post retweet
  try {
    var post = await Post.findByIdAndUpdate(
      postId,
      {
        [option]: { retweetUsers: userId },
      },
      { new: true }
    );
  } catch (err) {
    console.log(err.message);
    return res.sendStatus(400);
  }

  res.status(200).send(post);
});

router.delete("/:id", async (req, res, next) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
  } catch (err) {
    console.log(err.message);
    return res.sendStatus(400);
  }
});

async function getPosts(filter) {
  let results;
  try {
    // Getting all the posts from the database and embedding the user info
    results = await Post.find(filter)
      .populate("postedBy")
      .populate("retweetData")
      .populate("replyTo")
      .sort({ createdAt: -1 });
  } catch (err) {
    return console.log(err.message);
  }

  results = await User.populate(results, { path: "replyTo.postedBy" });
  return await User.populate(results, { path: "retweetData.postedBy" });
}

// Exporting the router to the app
module.exports = router;
