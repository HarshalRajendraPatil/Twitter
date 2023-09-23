// Requiring all the modules
const express = require("express");
const User = require("../schemas/userSchema");
const bcrypt = require("bcrypt");

// Creating the router that will be exported to the app
const router = express.Router();

// Route for login on GET request
router.get("/", (req, res, next) => {
  res.status(200).render("login");
});

// Route for login on POST request
router.post("/", async (req, res, next) => {
  let user = null;
  const payload = req.body;

  // Finding the user with the given email or password
  if (req.body.logUsername && req.body.logPassword) {
    try {
      user = await User.findOne({
        $or: [
          { username: req.body.logUsername },
          { email: req.body.logUsername },
        ],
      });
    } catch {
      payload.errMessage = "Login failed. Try again later.";
      return res.status(200).render("login", payload);
    }

    // Comparing passwords when user is found
    if (user != null) {
      const result = await bcrypt.compare(req.body.logPassword, user.password);

      if (result) {
        req.session.user = user;
        return res.redirect("/");
      }
    }

    // Showing the error when email or password is incorrect
    payload.errMessage = "Incorrect Email or Password. Try again";
    return res.status(200).render("login", payload);
  }

  // Showing the error when user does not fill the required fields
  payload.errMessage = "Make sure to fill all the values.";
  return res.status(200).render("login", payload);
});

// Exporting the router to the app
module.exports = router;
