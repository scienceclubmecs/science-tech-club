import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "science_tech_club"
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB error", err);
    process.exit(1);
  }
};
