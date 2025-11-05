import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: String,
  address: String,
  userId: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Project ||
  mongoose.model("Project", projectSchema);
