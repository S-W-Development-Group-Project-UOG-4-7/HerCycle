const mongoose = require("mongoose");

const dailyLogSchema = new mongoose.Schema(
  {
    NIC: { type: String, required: true, index: true },

    date: { type: Date, required: true, index: true },

    flow: {
      type: String,
      enum: ["none", "spotting", "light", "medium", "heavy"],
      default: "none",
    },

    pain_level: { type: Number, min: 0, max: 5, default: 0 },

    symptoms: { type: [String], default: [] },
    mood: { type: String, default: "" },
    notes: { type: String, default: "" },

    // Soft delete
    is_deleted: { type: Boolean, default: false, index: true },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true }
);

// Prevent duplicates for same NIC + same date (only for non-deleted items)
dailyLogSchema.index(
  { NIC: 1, date: 1 },
  { unique: true, partialFilterExpression: { is_deleted: false } }
);

module.exports = mongoose.models.DailyLog || mongoose.model("DailyLog", dailyLogSchema);
