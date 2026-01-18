import express from "express";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import { isAdminEquivalent } from "../middleware/roles.js";
import { ROLES } from "../models/enums.js";

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  res.json(req.user);
});

router.put("/me", auth, async (req, res) => {
  const { department, interests, photoUrl } = req.body;
  req.user.profile.department =
    department || req.user.profile.department;
  req.user.profile.interests =
    interests || req.user.profile.interests;
  if (photoUrl) req.user.profile.photoUrl = photoUrl;
  await req.user.save();
  res.json(req.user);
});

router.post("/promote", auth, async (req, res) => {
  if (!isAdminEquivalent(req.user))
    return res.status(403).json({ message: "Forbidden" });
  await User.updateMany(
    { role: ROLES.STUDENT },
    { $inc: { "profile.year": 1 } }
  );
  res.json({ message: "All students promoted" });
});

router.get("/stats/counts", auth, async (req, res) => {
  const students = await User.countDocuments({ role: ROLES.STUDENT });
  const faculty = await User.countDocuments({ role: ROLES.FACULTY });
  res.json({ students, faculty });
});

router.get("/chair", auth, async (req, res) => {
  const chair = await User.findOne({
    role: ROLES.COMMITTEE_CHAIR
  }).select("_id username");
  if (!chair) return res.status(404).json({ message: "Chair not found" });
  res.json(chair);
});

export default router;
