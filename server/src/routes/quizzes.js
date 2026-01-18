import express from "express";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { auth } from "../middleware/auth.js";
import Quiz from "../models/Quiz.js";
import { generateRandomQuestions } from "../utils/quizGenerator.js";
import { ROLES } from "../models/enums.js";

const upload = multer();
const router = express.Router();

router.post("/syllabus-upload", auth, upload.single("file"), async (req, res) => {
  if (req.user.role !== ROLES.ADMIN)
    return res.status(403).json({ message: "Only admin" });
  const { department, year } = req.body;
  const text = req.file.buffer.toString("utf8");
  const questions = generateRandomQuestions(text, 10);
  const quiz = await Quiz.create({
    title: `${department} Year ${year} Auto Quiz`,
    department,
    year,
    approvedByAdmin: true,
    createdBy: req.user._id,
    questions
  });
  res.json(quiz);
});

router.post("/", auth, async (req, res) => {
  if (req.user.role !== ROLES.FACULTY)
    return res.status(403).json({ message: "Only faculty" });
  const { title, department, year, questions } = req.body;
  const quiz = await Quiz.create({
    title,
    department,
    year,
    questions,
    createdBy: req.user._id
  });
  res.json(quiz);
});

router.post("/:id/approve", auth, async (req, res) => {
  if (req.user.role !== ROLES.ADMIN)
    return res.status(403).json({ message: "Only admin" });
  const quiz = await Quiz.findByIdAndUpdate(
    req.params.id,
    { approvedByAdmin: true },
    { new: true }
  );
  res.json(quiz);
});

router.get("/", auth, async (req, res) => {
  const { department, year } = req.query;
  const quizzes = await Quiz.find({
    department,
    year,
    approvedByAdmin: true
  });
  res.json(quizzes);
});

export default router;
