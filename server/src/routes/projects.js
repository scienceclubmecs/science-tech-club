import express from "express";
import { auth } from "../middleware/auth.js";
import Project from "../models/Project.js";
import { isAdminEquivalent } from "../middleware/roles.js";

const router = express.Router();

const withChatRoom = (project) => ({
  ...project.toObject(),
  chatRoom: `proj:${project._id.toString()}`
});

router.post("/", auth, async (req, res) => {
  const { title, description, department, year, maxMembers } = req.body;
  const project = await Project.create({
    title,
    description,
    department,
    year,
    maxMembers,
    createdBy: req.user._id,
    members: [{ user: req.user._id, role: "owner" }]
  });
  res.json(withChatRoom(project));
});

router.get("/mine", auth, async (req, res) => {
  const projects = await Project.find({ "members.user": req.user._id });
  res.json(projects.map(withChatRoom));
});

router.get("/", auth, async (req, res) => {
  const projects = await Project.find({});
  res.json(projects.map(withChatRoom));
});

router.post("/:id/join", auth, async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Not found" });
  if (project.members.some((m) => m.user.equals(req.user._id)))
    return res.status(400).json({ message: "Already member" });
  if (project.members.length >= project.maxMembers)
    return res.status(400).json({ message: "No vacancies" });
  project.members.push({ user: req.user._id, role: "member" });
  await project.save();
  res.json(withChatRoom(project));
});

router.post("/:id/assign-guide", auth, async (req, res) => {
  if (!isAdminEquivalent(req.user))
    return res.status(403).json({ message: "Forbidden" });
  const { guideId } = req.body;
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { guide: guideId },
    { new: true }
  );
  res.json(withChatRoom(project));
});

export default router;
