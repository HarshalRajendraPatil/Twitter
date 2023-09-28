// Requiring all the modules
const express = require("express");

// Creating the router that will be exported to the app
const router = express.Router();

// Route for login on GET request
router.get("/:id", (req, res, next) => {
  const payload = {
    pageTitle: "View post",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    postId: req.params.id,
  };
  res.status(200).render("postPage", payload);
});

// Exporting the router to the app
module.exports = router;
