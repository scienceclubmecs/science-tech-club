import express from "express";
import { supabase } from "../config/supabase.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

const canEditConfig = (user) => user?.role === "admin" || user?.isDeveloper === true;

// Public: frontend can read logo/name without login
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("site_config")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) return res.status(500).json({ message: "Failed to load config" });
  res.json(data);
});

// Admin/Developer: update logo/name/git
router.put("/", auth, async (req, res) => {
  if (!canEditConfig(req.user)) return res.status(403).json({ message: "Forbidden" });

  const { siteName, logoUrl, gitRepoUrl } = req.body || {};

  const payload = {
    id: 1,
    site_name: siteName ?? null,
    logo_url: logoUrl ?? null,
    git_repo_url: gitRepoUrl ?? null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("site_config")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) return res.status(400).json({ message: "Failed to save config" });
  res.json(data);
});

// Admin/Developer: update faculty roles
router.put("/faculty-roles", auth, async (req, res) => {
  if (!canEditConfig(req.user)) return res.status(403).json({ message: "Forbidden" });

  const { coordinator, manager, advisor, incharge } = req.body || {};

  const payload = {
    id: 1,
    faculty_coordinator: coordinator || null,
    faculty_manager: manager || null,
    faculty_advisor: advisor || null,
    incharge: incharge || null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("site_config")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) return res.status(400).json({ message: "Failed to save faculty roles" });
  res.json(data);
});

export default router;
