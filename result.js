
import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    subject: { type: String, required: true },
    score: { type: Number, required: true },
    term: { type: String, required: true },
    session: { type: String, required: true }
});

export default mongoose.model("Result", resultSchema);