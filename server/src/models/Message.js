import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    room: String, // e.g. exec_common, proj:<id>, dm:<uidA>:<uidB>, student_committee
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
