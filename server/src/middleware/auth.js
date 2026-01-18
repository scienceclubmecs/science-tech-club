import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";

export const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.SUPABASE_ANON_KEY || "fallback");
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", payload.id)
      .single();
    if (error || !data) return res.status(401).json({ message: "User not found" });
    req.user = data;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
