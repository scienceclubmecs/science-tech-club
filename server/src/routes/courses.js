import express from "express";
import { supabase } from "../config/supabase.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Helper: Extract YouTube video ID
function getYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

// Get all courses
router.get("/", auth, async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = supabase
      .from("courses")
      .select(`
        *,
        creator:users!courses_created_by_fkey(id, username, role)
      `)
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("Get courses error:", err);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

// Get single course
router.get("/:id", auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        creator:users!courses_created_by_fkey(id, username, role)
      `)
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(data);
  } catch (err) {
    console.error("Get course error:", err);
    res.status(404).json({ message: "Course not found" });
  }
});

// Create course (admin/committee only)
router.post("/", auth, async (req, res) => {
  const allowedRoles = ["admin", "committee_chair", "committee_vice_chair", "secretary", "vice_secretary"];
  const hasAccess = allowedRoles.includes(req.user.role) || req.user.is_committee;

  if (!hasAccess) {
    return res.status(403).json({ message: "Only admin/committee can create courses" });
  }

  const { title, description, video_url, thumbnail_url, duration, category } = req.body;

  if (!title || !video_url) {
    return res.status(400).json({ message: "title and video_url required" });
  }

  try {
    // Auto-generate thumbnail from YouTube if not provided
    let finalThumbnail = thumbnail_url;
    if (!finalThumbnail && video_url.includes('youtube.com') || video_url.includes('youtu.be')) {
      const videoId = getYouTubeId(video_url);
      if (videoId) {
        finalThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }

    const { data, error } = await supabase
      .from("courses")
      .insert({
        title,
        description: description || null,
        video_url,
        thumbnail_url: finalThumbnail || null,
        duration: duration || 0,
        category: category || "General",
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ message: "Course created successfully", course: data });
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ message: "Failed to create course" });
  }
});

// Update course
router.put("/:id", auth, async (req, res) => {
  const allowedRoles = ["admin", "committee_chair", "secretary"];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Permission denied" });
  }

  const { title, description, video_url, thumbnail_url, duration, category } = req.body;

  try {
    const { data, error } = await supabase
      .from("courses")
      .update({ 
        title, 
        description, 
        video_url, 
        thumbnail_url, 
        duration, 
        category,
        updated_at: new Date().toISOString()
      })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: "Course updated successfully", course: data });
  } catch (err) {
    console.error("Update course error:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

// Delete course (admin only)
router.delete("/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }

  try {
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("Delete course error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
