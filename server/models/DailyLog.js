const mongoose = require("mongoose");

const dailyLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },

    flow: {
      type: String,
      enum: ["none", "light", "medium", "heavy"],
      default: "none",
    },

    painLevel: { type: Number, min: 0, max: 5, default: 0 },

    symptoms: [{ type: String }], // e.g., ["cramps", "bloating"]
    mood: { type: String },       // e.g., "happy", "anxious"

    sleepHours: { type: Number, min: 0, max: 24 },
    energyLevel: { type: Number, min: 0, max: 10 },

    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// prevent duplicate logs for same user + date
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyLog", dailyLogSchema);
