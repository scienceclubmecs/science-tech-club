import express from "express";
import multer from "multer";
import { parse } from "csv-parse/sync";
import bcrypt from "bcryptjs";
import { supabase } from "../config/supabase.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Dashboard stats (FIXED)
router.get("/dashboard", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const [usersRes, coursesRes] = await Promise.all([
      supabase.from("users").select("role"),
      supabase.from("courses").select("id")
    ]);

    const users = usersRes.data || [];
    const courses = coursesRes.data || [];

    const stats = {
      students: users.filter(u => u.role === "student").length,
      faculty: users.filter(u => u.role === "faculty").length,
      total: users.length,
      courses: courses.length
    };

    res.json(stats);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add student manually (FIXED)
router.post("/add-student", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }

  const { username, email, department, year, password, interests } = req.body;

  if (!username || !email || !password || password.length < 6) {
    return res.status(400).json({ message: "username, email, password (6+ chars) required" });
  }

  try {
    // Check if username exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        username,
        email,
        role: "student",
        department: department || null,
        year: parseInt(year) || 1,
        interests: interests ? interests.split(",").map(s => s.trim()).filter(Boolean) : []
      })
      .select("id, username, email")
      .single();

    if (userError) {
      console.error("User creation error:", userError);
      return res.status(400).json({ message: "Failed to create user" });
    }

    // Hash and store password
    const hash = await bcrypt.hash(password, 10);
    const { error: pwdError } = await supabase
      .from("user_passwords")
      .insert({ user_id: newUser.id, password_hash: hash });

    if (pwdError) {
      console.error("Password error:", pwdError);
      // Rollback user creation
      await supabase.from("users").delete().eq("id", newUser.id);
      return res.status(500).json({ message: "Password creation failed" });
    }

    res.json({ message: "Student created successfully", user: newUser });
  } catch (err) {
    console.error("Add student error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add faculty manually (FIXED)
router.post("/add-faculty", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }

  const { username, email, department, password } = req.body;

  if (!username || !email || !password || password.length < 6) {
    return res.status(400).json({ message: "username, email, password (6+ chars) required" });
  }

  try {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        username,
        email,
        role: "faculty",
        department: department || null
      })
      .select("id, username, email")
      .single();

    if (userError) {
      console.error("User creation error:", userError);
      return res.status(400).json({ message: "Failed to create user" });
    }

    const hash = await bcrypt.hash(password, 10);
    const { error: pwdError } = await supabase
      .from("user_passwords")
      .insert({ user_id: newUser.id, password_hash: hash });

    if (pwdError) {
      console.error("Password error:", pwdError);
      await supabase.from("users").delete().eq("id", newUser.id);
      return res.status(500).json({ message: "Password creation failed" });
    }

    res.json({ message: "Faculty created successfully", user: newUser });
  } catch (err) {
    console.error("Add faculty error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ... (Keep existing CSV upload, set-role, reset-password endpoints from previous version)

export default router;
