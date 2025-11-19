
import express from "express";
import Result from "../models/Result.js";

const router = express.Router();

// Add Result
router.post("/", async (req, res) => {
    try {
        const result = await Result.create(req.body);
        res.json({ success: true, result });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

export default router;