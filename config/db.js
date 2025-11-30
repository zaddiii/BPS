import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

let client;
let db;

export const connectDB = async () => {
  try {
    if (!client) {
      client = new MongoClient(process.env.MONGO_URI);
      await client.connect();
      db = client.db("BPS"); // your database name
      console.log("MongoDB connected to BPS");
    }
    return db;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // stop server if DB fails
  }
};

/**
 * Returns the DB instance. If not connected yet, throws an error.
 * In production, you can also make this async to auto-wait for connection.
 */
export const getDB = () => {
  if (!db) {
    throw new Error(
      "Database not connected yet. Make sure connectDB() is called before using routes."
    );
  }
  return db;
};