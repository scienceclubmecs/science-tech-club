import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    const { data: user, error: userErr } = await supabase
      .from("users")
      .select(
        "id, username, email, role, is_committee, is_executive, is_representative, is_developer, department, interests, year, photo_url"
      )
      .eq("username", username)
      .single();

    if (userErr || !user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { data: passRow, error: passErr } = await supabase
      .from("user_passwords")
      .select("password_hash")
      .eq("user_id", user.id)
      .single();

    if (passErr || !passRow?.password_hash) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, passRow.password_hash);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(user.id);

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isCommittee: !!user.is_committee,
        isExecutive: !!user.is_executive,
        isRepresentative: !!user.is_representative,
        isDeveloper: !!user.is_developer,
        profile: {
          department: user.department,
          interests: user.interests || [],
          year: user.year,
          photoUrl: user.photo_url
        }
      }
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * Admin changes OWN password
 * POST /api/auth/change-password
 * Body: { oldPassword, newPassword }
 */
router.post("/change-password", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can change password" });
    }

    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "oldPassword and newPassword required" });
    }

    const { data: passRow, error: passErr } = await supabase
      .from("user_passwords")
      .select("password_hash")
      .eq("user_id", req.user.id)
      .single();

    if (passErr || !passRow?.password_hash) {
      return res.status(400).json({ message: "Password record missing" });
    }

    const ok = await bcrypt.compare(oldPassword, passRow.password_hash);
    if (!ok) return res.status(400).json({ message: "Old password incorrect" });

    const newHash = await bcrypt.hash(newPassword, 10);

    const { error: updErr } = await supabase
      .from("user_passwords")
      .update({ password_hash: newHash })
      .eq("user_id", req.user.id);

    if (updErr) return res.status(400).json({ message: "Failed to update password" });

    return res.json({ message: "Password updated successfully" });
  } catch (e) {
    console.error("Change password error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
