
import express from "express";
import { getDB } from "../config/db.js";

const router = express.Router();

// GET all students
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const students = await db.collection("students").find().toArray();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single student by rollNo
router.get("/:rollNo", async (req, res) => {
  try {
    const db = getDB();
    const student = await db
      .collection("students")
      .findOne({ rollNo: parseInt(req.params.rollNo) });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new student
router.post("/", async (req, res) => {
  try {
    const { name, className, rollNo } = req.body;
    if (!name || !className || !rollNo)
      return res.status(400).json({ message: "Missing fields" });

    const db = getDB();
    const existing = await db.collection("students").findOne({ rollNo });
    if (existing) return res.status(400).json({ message: "Roll number exists" });

    const result = await db.collection("students").insertOne({ name, className, rollNo });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
