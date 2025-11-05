import mongoose from "mongoose";

let isConnected = false;

export async function connectToDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection error:", err);
  }
}
