import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: { type: String, enum: ["owner", "member"] }
});

const projectSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    department: String,
    year: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members: [memberSchema],
    maxMembers: { type: Number, default: 5 },
    isApproved: { type: Boolean, default: false },
    guide: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
