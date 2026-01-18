import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  name: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["pending", "in_progress", "done"],
    default: "pending"
  }
});

const eventSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    date: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedByChair: { type: Boolean, default: false },
    tasks: [taskSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
