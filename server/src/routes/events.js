import express from "express";
import { supabase } from "../config/supabase.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  if (!["executive_head", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { title, description, date } = req.body;
  const { data, error } = await supabase
    .from("events")
    .insert({
      title,
      description,
      date,
      created_by: req.user.id
    })
    .select()
    .single();
  if (error) return res.status(400).json({ error });
  res.json(data);
});

router.post("/:id/approve", auth, async (req, res) => {
  if (req.user.role !== "committee_chair") {
    return res.status(403).json({ message: "Only chair" });
  }
  const { data, error } = await supabase
    .from("events")
    .update({ approved_by_chair: true })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(404).json({ error });
  res.json(data);
});

router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("approved_by_chair", true);
  if (error) return res.status(500).json({ error });
  res.json(data || []);
});

export default router;
