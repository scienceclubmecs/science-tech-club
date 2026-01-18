import mongoose from "mongoose";

const configSchema = new mongoose.Schema(
  {
    gitRepoUrl: String,
    theme: {
      primary: { type: String, default: "#ffffff" },
      background: { type: String, default: "#000000" }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Config", configSchema);
