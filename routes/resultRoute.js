
import express from "express";
import { getDB } from "../config/db.js";

const router = express.Router();

// GET all results
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const results = await db.collection("results").find().toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET results for a student by rollNo
router.get("/:rollNo", async (req, res) => {
  try {
    const db = getDB();
    const results = await db
      .collection("results")
      .find({ rollNo: parseInt(req.params.rollNo) })
      .toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new result
router.post("/", async (req, res) => {
  try {
    const { rollNo, subject, score, grade } = req.body;
    if (!rollNo || !subject || score == null)
      return res.status(400).json({ message: "Missing fields" });

    const db = getDB();
    const result = await db.collection("results").insertOne({ rollNo, subject, score, grade });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// POST /api/results/check → query results by rollNo, term, session
// ==============================
router.post("/check", async (req, res) => {
  try {
    const { rollNo, term, session } = req.body;
    if (!rollNo || !term || !session) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const db = getDB();
    const results = await db
      .collection("results")
      .find({ rollNo, term, session })
      .toArray();

    if (results.length === 0) {
      return res.status(404).json({ message: "No results found" });
    }

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;