// Requiring all the modules
const express = require("express");

// Creating the router that will be exported to the app
const router = express.Router();

// Route for login on GET request
router.get("/", (req, res, next) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  }
});

module.exports = router;
