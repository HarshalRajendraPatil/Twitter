// Requiring all the modules
const express = require("express");
const User = require("../schemas/userSchema");

// Creating the router that will be exported to the app
const router = express.Router();

// Route for profile page on GET request
router.get("/", (req, res, next) => {
  const payload = {
    pageTitle: req.session.user.username,
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    profileUser: req.session.user,
  };
  res.status(200).render("profilePage", payload);
});

// Route for profile page with specific id on GET request for post
router.get("/:username", async (req, res, next) => {
  const payload = await getPayload(req.params.username, req.session.user);
  res.status(200).render("profilePage", payload);
});

// Route for profile page with specific id on GET request for replies
router.get("/:username/replies", async (req, res, next) => {
  const payload = await getPayload(req.params.username, req.session.user);
  payload.selectedTab = "replies";
  res.status(200).render("profilePage", payload);
});

// Create the payload based on the existing user
async function getPayload(username, userLoggedIn) {
  let user = await User.findOne({ username });

  if (user == null) {
    user = await User.findById(username);

    if (user == null) {
      return {
        pageTitle: "User not found",
        userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
      };
    }
  }

  return {
    pageTitle: user.username,
    userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
    profileUser: user,
  };
}

// Exporting the router to the app
module.exports = router;
