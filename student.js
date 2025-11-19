
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    studentId: { type: String, required: true, unique: true },
    studentClass: { type: String, required: true }
});

export default mongoose.model("Student", studentSchema);