import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
let db;

export const connectDB = async () => {
  try {
    await client.connect();
    db = client.db("BPS"); // <-- your database name
    console.log("MongoDB connected to BPS");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

// FIXED: renamed to match subjectRoute import
export const getDb = () => {
  if (!db) throw new Error("Database not connected");
  return db;
};