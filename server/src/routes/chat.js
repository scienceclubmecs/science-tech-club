import express from "express";
import { supabase } from "../config/supabase.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Get messages for a room
router.get("/:room", auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        user:users!messages_user_id_fkey(id, username, role)
      `)
      .eq("room", req.params.room)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Send message
router.post("/", auth, async (req, res) => {
  const { room, message } = req.body;

  if (!room || !message?.trim()) {
    return res.status(400).json({ message: "room and message required" });
  }

  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        room,
        user_id: req.user.id,
        message: message.trim()
      })
      .select(`
        *,
        user:users!messages_user_id_fkey(id, username, role)
      `)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// Delete message (admin/sender only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const { data: message } = await supabase
      .from("messages")
      .select("user_id")
      .eq("id", req.params.id)
      .single();

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only message sender or admin can delete
    if (message.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Permission denied" });
    }

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Delete message error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
