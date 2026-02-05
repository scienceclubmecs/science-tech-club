import express from "express";
import multer from "multer";
import { parse } from "csv-parse/sync";
import bcrypt from "bcryptjs";
import { supabase } from "../config/supabase.js";
import { sendWelcomeMail } from "../utils/mail.js";
import { auth } from "../middleware/auth.js";
import { buildStudentUsername, buildFacultyUsername } from "../utils/username.js";
import express from "express";
import { supabase } from "../config/supabase.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.put("/set-role", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

  const { username, role, flag } = req.body || {};
  if (!username || !role) return res.status(400).json({ message: "username and role required" });

  const patch = { role };

  // optional flag updates
  if (flag === "isExecutive") patch.is_executive = true;
  if (flag === "isRepresentative") patch.is_representative = true;
  if (flag === "isDeveloper") patch.is_developer = true;

  const { data, error } = await supabase
    .from("users")
    .update(patch)
    .eq("username", username)
    .select("id, username, role, is_executive, is_representative, is_developer")
    .single();

  if (error) return res.status(400).json({ message: "Update failed" });
  res.json({ message: "Role updated", user: data });
});

export default router;

const upload = multer();
const router = express.Router();

router.use(auth);

router.use((req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
});

router.get("/dashboard", async (req, res) => {
  const [{ data: s }, { data: f }] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "faculty")
  ]);
  res.json({
    students: s?.length || 0,
    faculty: f?.length || 0
  });
});

router.post("/upload-students", upload.single("file"), async (req, res) => {
  const records = parse(req.file.buffer.toString("utf8"), {
    columns: true,
    skip_empty_lines: true
  });

  for (const r of records) {
    const username = buildStudentUsername(r.surname.trim(), r.dob.trim());
    const passwordPlain = username;
    const password_hash = await bcrypt.hash(passwordPlain, 10);

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        username,
        email: r.email || null,
        role: "student",
        department: r.department,
        year: Number(r.year || 1),
        interests: [],
        photo_url: r.photo_url || "/default.png"
      })
      .select("*")
      .single();

    if (!error && user) {
      await supabase.from("user_passwords").insert({
        user_id: user.id,
        password_hash
      });
      await sendWelcomeMail(user.email, user.username);
    }
  }

  res.json({ message: "Students uploaded and welcome mails sent (where email present)." });
});

router.post("/upload-faculty", upload.single("file"), async (req, res) => {
  const records = parse(req.file.buffer.toString("utf8"), {
    columns: true,
    skip_empty_lines: true
  });

  for (const r of records) {
    const username = buildFacultyUsername(r.email.trim());
    const passwordPlain = r.employmentId.trim();
    const password_hash = await bcrypt.hash(passwordPlain, 10);

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        username,
        email: r.email.trim(),
        role: "faculty",
        department: r.department,
        year: 0,
        interests: [],
        photo_url: r.photo_url || "/default.png"
      })
      .select("*")
      .single();

    if (!error && user) {
      await supabase.from("user_passwords").insert({
        user_id: user.id,
        password_hash
      });
      await sendWelcomeMail(user.email, user.username);
    }
  }

  res.json({ message: "Faculty uploaded and welcome mails sent." });
});

// Select faculty coordinator/manager/advisor/incharge
router.post("/set-faculty-roles", async (req, res) => {
  const { faculty_coordinator, faculty_manager, faculty_advisor, incharge } = req.body;
  const { error } = await supabase
    .from("config")
    .update({
      faculty_coordinator,
      faculty_manager,
      faculty_advisor,
      incharge
    })
    .eq("id", 1);
  if (error) return res.status(400).json({ message: "Failed to update config" });
  res.json({ message: "Faculty roles updated" });
});

// Config: site name, logo, git repo
router.get("/config", async (req, res) => {
  const { data, error } = await supabase.from("config").select("*").eq("id", 1).single();
  if (error || !data) return res.status(404).json({ message: "Config not found" });
  res.json(data);
});

router.post("/config", async (req, res) => {
  const { site_name, logo_url, git_repo_url, primary_color, background_color } = req.body;
  const { data, error } = await supabase
    .from("config")
    .update({
      site_name,
      logo_url,
      git_repo_url,
      primary_color,
      background_color
    })
    .eq("id", 1)
    .select("*")
    .single();
  if (error) return res.status(400).json({ message: "Failed to update config" });
  res.json(data);
});

export default router;
