import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";

export const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null; // Bearer <token> [web:233]
    if (!token) return res.status(401).json({ message: "No token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabase
      .from("users")
      .select(
        "id, username, email, role, is_committee, is_executive, is_representative, is_developer, department, interests, year, photo_url"
      )
      .eq("id", payload.id)
      .single();

    if (error || !user) return res.status(401).json({ message: "User not found" });

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      isCommittee: !!user.is_committee,
      isExecutive: !!user.is_executive,
      isRepresentative: !!user.is_representative,
      isDeveloper: !!user.is_developer,
      profile: {
        department: user.department,
        interests: user.interests || [],
        year: user.year,
        photoUrl: user.photo_url
      }
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
