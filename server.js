import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import studentRoute from "./routes/studentRoute.js";
import resultRoute from "./routes/resultRoute.js";
import adminStudentRoute from "./routes/adminStudentRoute.js";
import teacherRoute from "./routes/teacherRoute.js";
import subjectRoute from "./routes/subjectRoute.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["*"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

app.use("/api/students", studentRoute);
app.use("/api/results", resultRoute);
app.use("/api/admin/students", adminStudentRoute);
app.use("/api/teachers", teacherRoute);
app.use("/api/subjects", subjectRoute);

app.get("/", (req, res) => res.send("Result System API Running..."));

// ✅ Wrap server start inside async function
const startServer = async () => {
  try {
    await connectDB(); // Wait for MongoDB to connect
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();