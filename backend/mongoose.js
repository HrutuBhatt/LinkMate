// mongoose.js
const mongoose = require("mongoose");

const uri = "mongodb://localhost:27017/linkmate";

const connectToDb = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if unable to connect
  }
};

const disconnectFromDb = async () => {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
    process.exit(1); // Exit the process if unable to connect
  }
};

module.exports = { connectToDb, disconnectFromDb };
