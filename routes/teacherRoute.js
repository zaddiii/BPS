import express from "express";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// ============================
// GET all teachers
// ============================
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const teachers = await db.collection("teachers").find().toArray();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================
// POST add a new teacher
// ============================
router.post("/", async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      qualification,
      subjectSpecialization,
      classTeacher,
      yearsOfExperience,
      joiningDate,
    } = req.body;

    if (!fullName || !phone || !subjectSpecialization) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const db = getDB();

    const newTeacher = await db.collection("teachers").insertOne({
      fullName,
      phone,
      email,
      qualification,
      subjectSpecialization,
      classTeacher,
      yearsOfExperience,
      joiningDate,
      createdAt: new Date(),
    });

    res.status(201).json({ success: true, newTeacher });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================
// DELETE teacher
// ============================
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const result = await db
      .collection("teachers")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({ success: true, message: "Teacher deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;