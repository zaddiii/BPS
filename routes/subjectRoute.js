import express from "express";
import { getDB } from "../config/db.js"; 
import { ObjectId } from "mongodb";

const router = express.Router();

// Add subject to a class
router.post("/add", async (req, res) => {
  const { name, class: className } = req.body;

  if (!name || !className) {
    return res.status(400).json({ message: "Subject name and class are required" });
  }

  try {
    const db = getDB();
    const result = await db.collection("subjects").insertOne({
      name,
      class: className,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "Subject added successfully",
      subject: {
        id: result.insertedId,
        name,
        class: className,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all subjects for a class
router.get("/class/:className", async (req, res) => {
  try {
    const db = getDB();
    const subjects = await db
      .collection("subjects")
      .find({ class: req.params.className })
      .toArray();

    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete subject by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const db = getDB();
    const result = await db
      .collection("subjects")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Delete all subjects for a class
router.delete("/class/:className", async (req, res) => {
  try {
    const db = getDB();
    const result = await db
      .collection("subjects")
      .deleteMany({ class: req.params.className });

    res.status(200).json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all subjects grouped by class
router.get("/all", async (req, res) => {
  try {
    const db = getDB();
    const subjects = await db.collection("subjects").find().toArray();

    const grouped = subjects.reduce((acc, subject) => {
      if (!acc[subject.class]) acc[subject.class] = [];
      acc[subject.class].push({
        id: subject._id,
        name: subject.name,
      });
      return acc;
    }, {});

    res.status(200).json(grouped);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;