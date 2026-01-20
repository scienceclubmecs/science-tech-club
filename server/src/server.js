import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
// import other routes...

dotenv.config();

const app = express();
app.use(cors()); // keep open while testing; later restrict to Netlify domain [web:233]
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
// app.use("/api/users", usersRoutes) ... etc

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
