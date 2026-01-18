import express from "express";
import multer from "multer";
import { parse } from "csv-parse/sync";
import bcrypt from "bcryptjs";
import { auth } from "../middleware/auth.js";
import User from "../models/User.js";
import { buildStudentUsername, buildFacultyUsername } from "../utils/username.js";
import { ROLES } from "../models/enums.js";

const upload = multer();
const router = express.Router();

router.use(auth);

router.use((req, res, next) => {
  if (req.user.role !== ROLES.ADMIN)
    return res.status(403).json({ message: "Admin only" });
  next();
});

router.post("/upload-students", upload.single("file"), async (req, res) => {
  const records = parse(req.file.buffer.toString("utf8"), {
    columns: true,
    skip_empty_lines: true
  });
  for (const r of records) {
    const username = buildStudentUsername(r.surname.trim(), r.dob.trim());
    const passwordHash = await bcrypt.hash(username, 10);
    await User.create({
      username,
      passwordHash,
      role: ROLES.STUDENT,
      profile: {
        department: r.department,
        year: Number(r.year || 1),
        interests: [],
        photoUrl: r.photoUrl || "/default.png"
      }
    });
  }
  res.json({ message: "Students uploaded" });
});

router.post("/upload-faculty", upload.single("file"), async (req, res) => {
  const records = parse(req.file.buffer.toString("utf8"), {
    columns: true,
    skip_empty_lines: true
  });
  for (const r of records) {
    const username = buildFacultyUsername(r.email.trim());
    const passwordHash = await bcrypt.hash(r.employmentId.trim(), 10);
    await User.create({
      username,
      passwordHash,
      email: r.email.trim(),
      role: ROLES.FACULTY,
      profile: {
        department: r.department,
        year: 0,
        interests: [],
        photoUrl: r.photoUrl || "/default.png"
      }
    });
  }
  res.json({ message: "Faculty uploaded" });
});

router.post("/assign-role", async (req, res) => {
  const { userId, role, flags } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.role = role || user.role;
  if (flags) {
    if (typeof flags.isCommittee === "boolean") user.isCommittee = flags.isCommittee;
    if (typeof flags.isExecutive === "boolean") user.isExecutive = flags.isExecutive;
    if (typeof flags.isRepresentative === "boolean") user.isRepresentative = flags.isRepresentative;
    if (typeof flags.isDeveloper === "boolean") user.isDeveloper = flags.isDeveloper;
  }
  await user.save();
  res.json(user);
});

router.get("/dashboard", async (req, res) => {
  const students = await User.countDocuments({ role: ROLES.STUDENT });
  const faculty = await User.countDocuments({ role: ROLES.FACULTY });
  res.json({ students, faculty });
});

export default router;
