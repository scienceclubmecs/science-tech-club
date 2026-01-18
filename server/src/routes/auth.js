import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ message: "Invalid credentials" });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
  res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      role: user.role,
      isExecutive: user.isExecutive,
      isRepresentative: user.isRepresentative,
      isDeveloper: user.isDeveloper,
      profile: user.profile
    }
  });
});

export default router;
