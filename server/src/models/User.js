import mongoose from "mongoose";
import { ROLES, DEPARTMENTS } from "./enums.js";

const profileSchema = new mongoose.Schema({
  department: { type: String, enum: DEPARTMENTS },
  interests: { type: [String], default: [] },
  year: { type: Number, default: 1 },
  photoUrl: { type: String, required: true }
});

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    email: String,
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT
    },
    isCommittee: { type: Boolean, default: false },
    isExecutive: { type: Boolean, default: false },
    isRepresentative: { type: Boolean, default: false },
    isDeveloper: { type: Boolean, default: false },
    profile: profileSchema
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
