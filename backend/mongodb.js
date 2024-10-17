// mongodb.js
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const dbName = "mydb";

let client;
let db;

// console.log("mongodb is imported");

const connectToDb = async () => {
  try {
    if (!client) {
      client = new MongoClient(uri);
      await client.connect();
      db = client.db(dbName);
      console.log("Connected to MongoDB");
    }
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if unable to connect
  }
};

const getDb = () => {
  if (!db) {
    throw new Error("Database not connected");
  }
  return db;
};

const disconnectFromDb = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("Disconnected from MongoDB");
  }
};

module.exports = { connectToDb, getDb, disconnectFromDb };
