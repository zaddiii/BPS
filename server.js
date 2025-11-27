
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import studentRoute from "./routes/studentRoute.js";
import resultRoute from "./routes/resultRoute.js";

// NEW routes
import adminStudentRoute from "./routes/adminStudentRoute.js";
import teacherRoute from "./routes/teacherRoute.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// =======================
// FIXED CORS CONFIG
// =======================
app.use(
  cors({
    origin: [
      "https://online-school-portal.github.io",
      "https://devhamazi.github.io/BPS"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api/students", studentRoute);
app.use("/api/results", resultRoute);

// NEW admin routes
app.use("/api/admin/students", adminStudentRoute);
app.use("/api/teachers", teacherRoute);

// Test route
app.get("/", (req, res) => {
  res.send("Result System API Running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));