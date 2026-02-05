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
    const { data: users } = await supabase
      .from("users")
      .select("role");

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

    let inserted = 0;
    let updated = 0;

    for (const row of records) {
      const username = row.username?.trim();
      const email = row.email?.trim();
      const department = row.department?.trim();
      const year = parseInt(row.year) || 1;
      const password = row.password?.trim();
      const interests = row.interests?.split(",").map(s => s.trim()).filter(Boolean) || [];

      if (!username || !email || !password) continue;

      // Check if user exists
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

      if (existing) {
        // Update
        await supabase
          .from("users")
          .update({ email, department, year, interests })
          .eq("id", existing.id);
        updated++;
      } else {
        // Insert
        const { data: newUser } = await supabase
          .from("users")
          .insert({
            username,
            email,
            role: "student",
            department,
            year,
            interests
          })
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

    let inserted = 0;
    let updated = 0;

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
          .insert({
            username,
            email,
            role: "faculty",
            department
          })
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

// Set user role (admin only) - with department support for heads
router.put("/set-role", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { username, role, department, flag } = req.body || {};
  if (!username || !role) {
    return res.status(400).json({ message: "username and role required" });
  }

  const patch = { role };
  
  // Set department if provided (for heads)
  if (department) patch.department = department;

  // Optional flag updates
  if (flag === "isCommittee") patch.is_committee = true;
  if (flag === "isExecutive") patch.is_executive = true;
  if (flag === "isRepresentative") patch.is_representative = true;
  if (flag === "isDeveloper") patch.is_developer = true;

  const { data, error } = await supabase
    .from("users")
    .update(patch)
    .eq("username", username)
    .select("id, username, role, department, is_committee, is_executive, is_representative, is_developer")
    .single();

  if (error) return res.status(400).json({ message: "Update failed", error: error.message });
  res.json({ message: "Role updated successfully", user: data });
});

export default router;
