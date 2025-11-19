
import express from "express";
import Student from "../models/Student.js";

const router = express.Router();

// Add Student
router.post("/", async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.json({ success: true, student });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

export default router;