import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

// Routes
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import configRoutes from "./routes/config.js";

dotenv.config();

const app = express();

// Global middleware
app.use(cors()); // Allow frontend to call API [web:331]
app.use(express.json());
app.use(morgan("dev")); // Log requests for debugging

// Health check
app.get("/", (req, res) => res.json({ ok: true, message: "Science & Tech Club API" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/config", configRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API base: ${process.env.SUPABASE_URL}`);
});
