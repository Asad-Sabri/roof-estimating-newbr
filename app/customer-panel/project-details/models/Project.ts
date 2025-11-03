import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  first_name: String,
  middle_name: String,
  last_name: String,
  email: String,
  mobile_number: String,
  roof_type: String,
  property_type: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip_code: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

export default Project;
