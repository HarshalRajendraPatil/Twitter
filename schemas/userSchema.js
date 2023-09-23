// Requiring all the modules
const mongoose = require("mongoose");

// Defining the user schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required."],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required."],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required."],
      unique: [true, "Username must be unique."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: [true, "Email must be unique."],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    profilePic: {
      type: String,
      default: "/images/profilePic.png ",
    },
  },
  { timestamps: true }
);

// Creating the user model
const User = mongoose.model("User", userSchema);

// Exporting the User model.
module.exports = User;
