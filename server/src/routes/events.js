import express from "express";
import { auth } from "../middleware/auth.js";
import Event from "../models/Event.js";
import { ROLES } from "../models/enums.js";

const router = express.Router();

const defaultTasks = [
  "Photos",
  "Poster design",
  "Banner design",
  "Report writing"
];

router.post("/", auth, async (req, res) => {
  if (req.user.role !== ROLES.EXECUTIVE_HEAD && req.user.role !== ROLES.ADMIN)
    return res.status(403).json({ message: "Only executive head/admin" });

  const { title, description, date } = req.body;
  const tasks = defaultTasks.map((t) => ({ name: t }));
  const event = await Event.create({
    title,
    description,
    date,
    createdBy: req.user._id,
    tasks
  });
  res.json(event);
});

router.post("/:id/approve", auth, async (req, res) => {
  if (req.user.role !== ROLES.COMMITTEE_CHAIR)
    return res.status(403).json({ message: "Only chair" });
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { approvedByChair: true },
    { new: true }
  );
  res.json(event);
});

router.put("/:id", auth, async (req, res) => {
  if (![ROLES.ADMIN, ROLES.EXECUTIVE_HEAD].includes(req.user.role))
    return res.status(403).json({ message: "Forbidden" });
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  res.json(event);
});

router.get("/", async (req, res) => {
  const events = await Event.find({ approvedByChair: true });
  res.json(events);
});

export default router;
