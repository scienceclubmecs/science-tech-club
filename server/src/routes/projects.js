import express from "express";
import { supabase } from "../config/supabase.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { title, description, department, year, max_members } = req.body;
  const { data, error } = await supabase
    .from("projects")
    .insert({
      title,
      description,
      department,
      year,
      max_members,
      created_by: req.user.id
    })
    .select()
    .single();
  if (error) return res.status(400).json({ error });

  // Auto add creator as owner
  await supabase.from("project_members").insert({
    project_id: data.id,
    user_id: req.user.id,
    member_role: "owner"
  });

  res.json({ ...data, chatRoom: `proj:${data.id}` });
});

router.get("/mine", auth, async (req, res) => {
  const { data: projects } = await supabase
    .from("project_members")
    .select("*, project:project_id(*)")
    .eq("user_id", req.user.id);
  res.json(projects?.map(p => ({ ...p.project, chatRoom: `proj:${p.project.id}` })) || []);
});

router.get("/", auth, async (req, res) => {
  const { data: projects } = await supabase
    .from("projects")
    .select("*");
  res.json(projects?.map(p => ({ ...p, chatRoom: `proj:${p.id}` })) || []);
});

router.post("/:id/join", auth, async (req, res) => {
  const { data: project } = await supabase
    .from("projects")
    .select("*, project_members(count)")
    .eq("id", req.params.id)
    .single();
  
  if (!project) return res.status(404).json({ message: "Not found" });
  if (project.project_members.count >= project.max_members) {
    return res.status(400).json({ message: "No vacancies" });
  }

  const { error } = await supabase.from("project_members").insert({
    project_id: req.params.id,
    user_id: req.user.id,
    member_role: "member"
  });
  if (error) return res.status(400).json({ error });

  const { data: fullProject } = await supabase
    .from("projects")
    .select("*")
    .eq("id", req.params.id)
    .single();
  res.json({ ...fullProject, chatRoom: `proj:${fullProject.id}` });
});

export default router;
