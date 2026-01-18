import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || "jwt-secret", {
    expiresIn: "7d"
  });

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();
  if (error || !user) return res.status(400).json({ message: "Invalid credentials" });

  const { data: pwRow } = await supabase
    .from("user_passwords")
    .select("password_hash")
    .eq("user_id", user.id)
    .single();

  if (!pwRow) return res.status(400).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, pwRow.password_hash);
  if (!ok) return res.status(400).json({ message: "Invalid credentials" });

  const token = signToken(user.id);
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      isExecutive: user.is_executive,
      isRepresentative: user.is_representative,
      isDeveloper: user.is_developer,
      profile: {
        department: user.department,
        interests: user.interests,
        year: user.year,
        photoUrl: user.photo_url
      }
    }
  });
});

// Admin change password for admin only
router.post("/change-admin-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("role", "admin")
    .single();

  if (!user) return res.status(400).json({ message: "Admin not found" });

  const { data: pwRow } = await supabase
    .from("user_passwords")
    .select("password_hash")
    .eq("user_id", user.id)
    .single();

  if (!pwRow) return res.status(400).json({ message: "Password not set" });

  const ok = await bcrypt.compare(oldPassword, pwRow.password_hash);
  if (!ok) return res.status(400).json({ message: "Old password incorrect" });

  const newHash = await bcrypt.hash(newPassword, 10);
  const { error } = await supabase
    .from("user_passwords")
    .update({ password_hash: newHash })
    .eq("user_id", user.id);
  if (error) return res.status(400).json({ message: "Failed to update" });

  res.json({ message: "Admin password updated" });
});

export default router;
