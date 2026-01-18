import express from "express";
import { supabase } from "../config/supabase.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ message: "Faculty only" });
  }
  const { title, department, year, questions } = req.body;
  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      title,
      department,
      year,
      created_by: req.user.id
    })
    .select()
    .single();
  if (error) return res.status(400).json({ error });
  res.json(data);
});

router.post("/:id/approve", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  const { data, error } = await supabase
    .from("quizzes")
    .update({ approved_by_admin: true })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(404).json({ error });
  res.json(data);
});

router.get("/", auth, async (req, res) => {
  const { department, year } = req.query;
  let query = supabase.from("quizzes").select("*").eq("approved_by_admin", true);
  if (department) query = query.eq("department", department);
  if (year) query = query.eq("year", Number(year));
  const { data, error } = await query;
  if (error) return res.status(500).json({ error });
  res.json(data || []);
});

export default router;
