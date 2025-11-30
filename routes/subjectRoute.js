import express from "express";
import { getDb } from "../config/db.js"; // your function to get DB connection
import { ObjectId } from "mongodb";

const router = express.Router();

// Add subject to a class
router.post("/add", async (req, res) => {
  const { name, class: className } = req.body;

  if (!name || !className)
    return res.status(400).json({ message: "Name and class are required" });

  try {
    const db = getDb();
    const result = await db.collection("subjects").insertOne({ name, class: className });
    res.status(201).json({ id: result.insertedId, name, class: className });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all subjects for a specific class
router.get("/class/:class", async (req, res) => {
  try {
    const db = getDb();
    const subjects = await db
      .collection("subjects")
      .find({ class: req.params.class })
      .toArray();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a subject by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const db = getDb();
    const result = await db.collection("subjects").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Subject not found" });

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Optional: Get all subjects grouped by class
router.get("/all", async (req, res) => {
  try {
    const db = getDb();
    const subjects = await db.collection("subjects").find().toArray();
    const grouped = subjects.reduce((acc, sub) => {
      if (!acc[sub.class]) acc[sub.class] = [];
      acc[sub.class].push({ id: sub._id, name: sub.name });
      return acc;
    }, {});
    res.status(200).json(grouped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
