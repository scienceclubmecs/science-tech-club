import express from "express";
import multer from "multer";
import { parse } from "csv-parse/sync";
import bcrypt from "bcryptjs";
import { supabase } from "../config/supabase.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Dashboard stats
router.get("/dashboard", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const { data: users } = await supabase.from("users").select("role");
    const stats = {
      students: users?.filter(u => u.role === "student").length || 0,
      faculty: users?.filter(u => u.role === "faculty").length || 0,
      total: users?.length || 0
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Upload students CSV
router.post("/upload-students", auth, upload.single("file"), async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const csvText = req.file.buffer.toString("utf-8");
    const records = parse(csvText, { columns: true, skip_empty_lines: true });

    let inserted = 0, updated = 0;

    for (const row of records) {
      const username = row.username?.trim();
      const email = row.email?.trim();
      const department = row.department?.trim();
      const year = parseInt(row.year) || 1;
      const password = row.password?.trim();
      const interests = row.interests?.split(",").map(s => s.trim()).filter(Boolean) || [];

      if (!username || !email || !password) continue;

      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

      if (existing) {
        await supabase
          .from("users")
          .update({ email, department, year, interests })
          .eq("id", existing.id);
        updated++;
      } else {
        const { data: newUser } = await supabase
          .from("users")
          .insert({ username, email, role: "student", department, year, interests })
          .select("id")
          .single();

        if (newUser) {
          const hash = await bcrypt.hash(password, 10);
          await supabase
            .from("user_passwords")
            .insert({ user_id: newUser.id, password_hash: hash });
          inserted++;
        }
      }
    }

    res.json({ message: `Students: ${inserted} inserted, ${updated} updated` });
  } catch (err) {
    console.error("Upload students error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// Upload faculty CSV
router.post("/upload-faculty", auth, upload.single("file"), async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const csvText = req.file.buffer.toString("utf-8");
    const records = parse(csvText, { columns: true, skip_empty_lines: true });

    let inserted = 0, updated = 0;

    for (const row of records) {
      const username = row.username?.trim();
      const email = row.email?.trim();
      const department = row.department?.trim();
      const password = row.password?.trim();

      if (!username || !email || !password) continue;

      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

      if (existing) {
        await supabase
          .from("users")
          .update({ email, department })
          .eq("id", existing.id);
        updated++;
      } else {
        const { data: newUser } = await supabase
          .from("users")
          .insert({ username, email, role: "faculty", department })
          .select("id")
          .single();

        if (newUser) {
          const hash = await bcrypt.hash(password, 10);
          await supabase
            .from("user_passwords")
            .insert({ user_id: newUser.id, password_hash: hash });
          inserted++;
        }
      }
    }

    res.json({ message: `Faculty: ${inserted} inserted, ${updated} updated` });
  } catch (err) {
    console.error("Upload faculty error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// Set user role
router.put("/set-role", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { username, role, department, flag } = req.body || {};
  
  if (!username || !role) {
    return res.status(400).json({ message: "username and role required" });
  }

  const patch = { role };
  
  if (department && department !== "") {
    patch.department = department;
  }

  if (flag === "isCommittee") patch.is_committee = true;
  if (flag === "isExecutive") patch.is_executive = true;
  if (flag === "isRepresentative") patch.is_representative = true;
  if (flag === "isDeveloper") patch.is_developer = true;

  try {
    const { data, error } = await supabase
      .from("users")
      .update(patch)
      .eq("username", username)
      .select("id, username, role, department")
      .single();

    if (error) {
      return res.status(400).json({ message: "Update failed", error: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Role updated", user: data });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// NEW: Reset single user password
router.put("/reset-password", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }

  const { username, password } = req.body;
  
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ message: "username and password (6+ chars) required" });
  }

  try {
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hash = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from("user_passwords")
      .upsert({ user_id: user.id, password_hash: hash }, { onConflict: "user_id" });

    if (error) {
      return res.status(500).json({ message: "Password update failed" });
    }

    res.json({ message: `Password reset for ${username}` });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// NEW: Bulk password reset from CSV
router.post("/bulk-passwords", auth, upload.single("file"), async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }

  try {
    const csvText = req.file.buffer.toString("utf-8");
    const records = parse(csvText, { columns: true, skip_empty_lines: true });

    let updated = 0;
    let errors = [];

    for (const row of records) {
      const username = row.username?.trim();
      const password = row.password?.trim();

      if (!username || !password || password.length < 6) {
        errors.push(`Invalid: ${username || 'missing username'}`);
        continue;
      }

      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

      if (user) {
        const hash = await bcrypt.hash(password, 10);
        await supabase
          .from("user_passwords")
          .upsert({ user_id: user.id, password_hash: hash });
        updated++;
      } else {
        errors.push(`Not found: ${username}`);
      }
    }

    res.json({ 
      message: `${updated} passwords updated`,
      errors: errors.length > 0 ? errors.slice(0, 10) : null 
    });
  } catch (err) {
    console.error("Bulk password error:", err);
    res.status(500).json({ message: "Bulk update failed" });
  }
});

export default router;
