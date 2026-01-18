import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: String,
  options: [String],
  correctIndex: Number
});

const quizSchema = new mongoose.Schema(
  {
    title: String,
    department: String,
    year: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedByAdmin: { type: Boolean, default: false },
    questions: [questionSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
