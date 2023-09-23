// Requiring all the modules
const express = require("express");
const User = require("../schemas/userSchema");
const bcrypt = require("bcrypt");

// Creating the router that will be exported to the app
const router = express.Router();

// Route for register on GET request
router.get("/", (req, res, next) => {
  res.status(200).render("register");
});

// Route for register on POST request
router.post("/", async (req, res, next) => {
  // Creating a global user variable
  let user = null;

  // Creating the user object
  const firstName = req.body.firstName.trim();
  const lastName = req.body.lastName.trim();
  const username = req.body.username.trim();
  const email = req.body.email.trim();
  const password = req.body.password;

  // Creating payload for the pug
  const payload = req.body;

  // Checking if the user has entered all the values
  if (firstName && lastName && username && email && password) {
    // Checking if there exists a user with same email or username
    try {
      user = await User.findOne({ $or: [{ username }, { email }] });
    } catch {
      payload.errMessage = "Registration failed. Try again later.";
      return res.status(200).render("register", payload);
    }

    // Creating the user if there exists no user with same email or username
    if (user != null) {
      if (email == user.email) {
        payload.errMessage = "Email already in use. Please Login.";
      } else {
        payload.errMessage = "Username already exists.";
      }
      return res.status(200).render("register", payload);
    } else {
      // Creating the user
      try {
        const data = req.body;

        // hashing the password
        data.password = await bcrypt.hash(data.password, 10);

        const newUser = await User.create(data);
        req.session.user = newUser;
        return res.redirect("/");
      } catch {
        payload.errMessage = "Registration failed. Try again later.";
        res.status(200).render("register", payload);
      }
    }
  } else {
    payload.errMessage = "Make sure each field has a value.";
    res.status(200).render("register", payload);
    return;
  }
});

// Exporting the router to the app
module.exports = router;
