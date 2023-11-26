// Requiring all the modules
const mongoose = require("mongoose");

// class for connecting the application to the database
class Database {
  constructor() {
    this.connect();
  }

  connect() {
    // Connecting to the database
    mongoose
      .connect(
        "mongodb+srv://harshalrptl62:qwerty123@twitter.quf3ewx.mongodb.net/TwitterCloneDB?retryWrites=true&w=majority"
      )
      .then(() => {
        console.log("Database Connection Successfull.");
      })
      .catch((err) => {
        console.log(`Connection failed. ${err.message}`);
      });
  }
}

// Exporting the object of the class
module.exports = new Database();
