// Requiring all the modules
const express = require("express");
const User = require("../../schemas/userSchema");
const Post = require("../../schemas/postSchema");

// Creating the router that will be exported to the app
const router = express.Router();

// Route for getting all the posts
router.put("/:userId/follow", async (req, res, next) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);

  if (user == null) return res.sendStatus(404);

  const isFollowing =
    user.followers && user.followers.includes(req.session.user._id);

  const option = isFollowing ? "$pull" : "$addToSet";

  try {
    req.session.user = await User.findByIdAndUpdate(
      req.session.user._id,
      {
        [option]: { following: userId },
      },
      { new: true }
    );

    await User.findByIdAndUpdate(
      userId,
      {
        [option]: { followers: req.session.user._id },
      },
      { new: true }
    );
  } catch (err) {
    console.log(err.message);
    return res.sendStatus(400);
  }
  res.status(200).send(req.session.user);
});

router.get("/:userId/following", async (req, res, next) => {
  try {
    const results = await User.findById(req.params.userId).populate(
      "following"
    );
    res.status(200).send(results);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
  }
});

router.get("/:userId/followers", async (req, res, next) => {
  try {
    const results = await User.findById(req.params.userId).populate(
      "followers"
    );
    res.status(200).send(results);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
  }
});

// Exporting the router to the app
module.exports = router;
