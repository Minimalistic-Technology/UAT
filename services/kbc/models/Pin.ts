import mongoose from "mongoose";

const pinSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin", 
    required: true,
    unique: true,
  },
  hashedPin: {
    type: String,
    required: true,
  },
  lastChanged: {
    type: Date,
    default: Date.now,
  },
});

export const Pin = mongoose.model("Pin", pinSchema);
