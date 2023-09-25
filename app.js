// Requiring all the modules
const express = require("express");
const middleware = require("./middleware");
const bodyParser = require("body-parser");
const session = require("express-session");
const database = require("./database"); // Its only being used to connect to database and its value is never read

// importing route files
const loginRoute = require("./routes/loginRoutes");
const registerRoute = require("./routes/registerRoutes");
const logoutRoute = require("./routes/logoutRoutes");

// importing the RESTful api files
const postApiRoute = require("./routes/api/posts");

// Creating the instance of Express
const app = express();

// Setting up the server settings
app.set("view engine", "pug");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(`${__dirname}/public`));
app.use(
  session({
    secret: "my application",
    resave: true,
    saveUninitialized: false,
  })
);

// Routes implementation
app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);

// Route for API Routes
app.use("/api/posts", postApiRoute);

// Home Route
app.get("/", middleware.requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };

  res.status(200).render("home", payload);
});

// Defining the port
const port = 3000;

// Starting the server
const server = app.listen(port, () => {
  console.log(`Server listening of port ${port}`);
});
