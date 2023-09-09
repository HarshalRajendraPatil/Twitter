// Requiring all the modules
const express = require("express");

// Creating the instance of Express
// const app = express();

// Creating the router that will be exported to the app
const router = express.Router();

// Setting up the view-engine and views folder
// app.set("view engine", "pug");
// app.set("views", "views");

// Routes
router.get("/", (req, res, next) => {
  // res.status(200).render("login");
  res.status(200).send("Hello");
});

// Exporting the router to the app
module.exports = router;
