// Requiring all the modules
const express = require("express");
const User = require("../../schemas/userSchema");
const Post = require("../../schemas/postSchema");

// Creating the router that will be exported to the app
const router = express.Router();

// Route for login on GET request
router.get("/", (req, res, next) => {
  res.status(200).send("data recieved.");
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

// Exporting the router to the app
module.exports = router;
