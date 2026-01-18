import express from "express";
import { auth } from "../middleware/auth.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { ROLES } from "../models/enums.js";

const router = express.Router();

const buildDmRoom = (id1, id2) => {
  const [a, b] = [id1.toString(), id2.toString()].sort();
  return `dm:${a}:${b}`;
};

router.get("/room/:room", auth, async (req, res) => {
  const msgs = await Message.find({ room: req.params.room })
    .sort("createdAt")
    .populate("from", "username role");
  res.json(msgs);
});

router.post("/room/:room", auth, async (req, res) => {
  const { text } = req.body;
  const msg = await Message.create({
    room: req.params.room,
    from: req.user._id,
    text
  });
  res.json(await msg.populate("from", "username role"));
});

router.get("/dm/:userId", auth, async (req, res) => {
  const { userId } = req.params;
  const room = buildDmRoom(req.user._id, userId);
  const msgs = await Message.find({ room })
    .sort("createdAt")
    .populate("from", "username role");
  res.json(msgs);
});

router.post("/dm/:userId", auth, async (req, res) => {
  const { userId } = req.params;
  const { text } = req.body;
  const room = buildDmRoom(req.user._id, userId);
  const msg = await Message.create({
    room,
    from: req.user._id,
    to: userId,
    text
  });
  res.json(await msg.populate("from", "username role"));
});

router.post("/student-to-committee", auth, async (req, res) => {
  if (req.user.role !== ROLES.STUDENT)
    return res.status(403).json({ message: "Students only" });
  const { text } = req.body;
  const msg = await Message.create({
    room: "student_committee",
    from: req.user._id,
    text
  });
  res.json(await msg.populate("from", "username role"));
});

router.get("/student-to-committee", auth, async (req, res) => {
  const msgs = await Message.find({ room: "student_committee" })
    .sort("createdAt")
    .populate("from", "username role");
  res.json(msgs);
});

router.post("/student-to-chair", auth, async (req, res) => {
  if (req.user.role !== ROLES.STUDENT)
    return res.status(403).json({ message: "Students only" });
  const { text } = req.body;
  const chair = await User.findOne({ role: ROLES.COMMITTEE_CHAIR });
  if (!chair) return res.status(404).json({ message: "Chair not found" });

  const room = buildDmRoom(req.user._id, chair._id);
  const msg = await Message.create({
    room,
    from: req.user._id,
    to: chair._id,
    text
  });
  res.json(await msg.populate("from", "username role"));
});

router.get("/student-to-chair", auth, async (req, res) => {
  const chair = await User.findOne({ role: ROLES.COMMITTEE_CHAIR });
  if (!chair) return res.status(404).json({ message: "Chair not found" });

  const room = buildDmRoom(req.user._id, chair._id);
  const msgs = await Message.find({ room })
    .sort("createdAt")
    .populate("from", "username role");
  res.json(msgs);
});

export default router;
