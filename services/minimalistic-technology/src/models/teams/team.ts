import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  imageUrl: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Team || mongoose.model("Team", teamSchema);