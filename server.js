
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";

import studentRoute from "./routes/studentRoute.js";
import resultRoute from "./routes/resultRoute.js";

dotenv.config();

// Connect to MongoDB
connectDB(); // initializes connection to BPS database

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/students", studentRoute);
app.use("/api/results", resultRoute);

// Test route
app.get("/", (req, res) => {
  res.send("Result System API Running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));