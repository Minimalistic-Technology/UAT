import mongoose from "mongoose";

const pinSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
    unique: true,
  },
  pinConfig: {
    // Array of 4 items, each can be null (auto-generated from date) or a digit 0-9 (hardcoded)
    type: [{
      type: Number,
      min: 0,
      max: 9,
      default: null
    }],
    required: true,
    default: [null, null, null, null],
    validate: {
      validator: function (v: any[]) {
        return Array.isArray(v) && v.length === 4;
      },
      message: 'pinConfig must be an array of 4 elements'
    }
  },
  lastChanged: {
    type: Date,
    default: Date.now,
  },
});

export const Pin = mongoose.model("Pin", pinSchema);
