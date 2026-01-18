import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { supabase } from "./config/supabase.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import projectRoutes from "./routes/projects.js";
import eventRoutes from "./routes/events.js";
import quizRoutes from "./routes/quizzes.js";
import chatRoutes from "./routes/chat.js";
import adminRoutes from "./routes/admin.js";
import chatbotRoutes from "./routes/chatbot.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "Science & Tech Club API running", 
    supabase: !!supabase 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
