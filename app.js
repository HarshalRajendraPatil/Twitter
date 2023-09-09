// Requiring all the modules
const express = require("express");
const middleware = require("./middleware");
const loginRoute = require("./routes/loginRoutes");

// Creating the instance of Express
const app = express();

// Setting up the view-engine and the view folder
app.set("view engine", "pug");
app.set("views", "views");

// Routes implementation
app.use("/login", loginRoute);

app.get("/", middleware.requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: "Home",
  };

  res.status(200).render("home", payload);
});

// Defining the port
const port = 3000;

// Starting the server
const server = app.listen(port, () => {
  console.log(`Server listening of port ${port}`);
});
