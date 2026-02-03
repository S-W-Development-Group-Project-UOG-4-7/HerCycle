const mongoose = require("mongoose");

const cycleProfileSchema = new mongoose.Schema(
  {
    NIC: { type: String, required: true, unique: true, index: true },

    cycle_length: { type: Number, default: 28 },
    period_length: { type: Number, default: 5 },

    last_period_start: { type: Date, default: null },
    next_period_predicted: { type: Date, default: null },

    tracking_preferences: {
      symptoms: { type: Boolean, default: true },
      mood: { type: Boolean, default: true },
      flow: { type: Boolean, default: true },
      pain: { type: Boolean, default: true },
      notes: { type: Boolean, default: true },
    },

    privacy_settings: {
      share_anonymized_insights: { type: Boolean, default: false },
    },

    is_active: { type: Boolean, default: true },
    is_anonymized: { type: Boolean, default: false },

    // Soft delete fields (optional; not used for profiles usually)
    is_deleted: { type: Boolean, default: false, index: true },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.CycleProfile || mongoose.model("CycleProfile", cycleProfileSchema);
