import express from "express";
import { supabase } from "../config/supabase.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

const buildDmRoom = (id1, id2) => {
  const [a, b] = [id1, id2].sort();
  return `dm:${a}:${b}`;
};

router.get("/room/:room", auth, async (req, res) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*, from_user:from_user_id(username, role)")
    .eq("room", req.params.room)
    .order("created_at");
  if (error) return res.status(500).json({ error });
  res.json(data || []);
});

router.post("/room/:room", auth, async (req, res) => {
  const { text } = req.body;
  const { data, error } = await supabase
    .from("messages")
    .insert({
      room: req.params.room,
      from_user: req.user.id,
      text
    })
    .select("*, from_user:from_user_id(username, role)")
    .single();
  if (error) return res.status(400).json({ error });
  res.json(data);
});

router.get("/dm/:userId", auth, async (req, res) => {
  const room = buildDmRoom(req.user.id, req.params.userId);
  const { data, error } = await supabase
    .from("messages")
    .select("*, from_user:from_user_id(username, role)")
    .eq("room", room)
    .order("created_at");
  if (error) return res.status(500).json({ error });
  res.json(data || []);
});

router.post("/dm/:userId", auth, async (req, res) => {
  const { text } = req.body;
  const room = buildDmRoom(req.user.id, req.params.userId);
  const { data, error } = await supabase
    .from("messages")
    .insert({
      room,
      from_user: req.user.id,
      to_user: req.params.userId,
      text
    })
    .select("*, from_user:from_user_id(username, role)")
    .single();
  if (error) return res.status(400).json({ error });
  res.json(data);
});

export default router;
