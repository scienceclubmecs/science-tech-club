import express from "express";
import { supabase } from "../config/supabase.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  res.json(req.user);
});

router.put("/me", auth, async (req, res) => {
  const { department, interests, photo_url } = req.body;
  const { data, error } = await supabase
    .from("users")
    .update({ 
      department,
      interests,
      photo_url,
      updated_at: new Date().toISOString()
    })
    .eq("id", req.user.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error });
  res.json(data);
});

router.post("/promote", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  const { error } = await supabase
    .rpc("promote_all_students"); // Create this function in Supabase SQL
  if (error) return res.status(400).json({ error });
  res.json({ message: "All students promoted" });
});

router.get("/stats/counts", auth, async (req, res) => {
  const [{ count: students }, { count: faculty }] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "faculty")
  ]);
  res.json({ students: students || 0, faculty: faculty || 0 });
});

router.get("/chair", auth, async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, username")
    .eq("role", "committee_chair")
    .single();
  if (error || !data) return res.status(404).json({ message: "Chair not found" });
  res.json(data);
});

export default router;
