
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import studentRoute from "./routes/studentRoute.js";
import resultRoute from "./routes/resultRoute.js";

// connect DB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/students", studentRoute);
app.use("/api/results", resultRoute);

app.get("/", (req, res) => {
    res.send("Result System API Running...");
});

// start server
app.listen(5000, () => console.log("Server running on port 5000"));