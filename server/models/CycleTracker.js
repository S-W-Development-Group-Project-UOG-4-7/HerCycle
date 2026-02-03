const mongoose = require("mongoose");

const cycleTrackerSchema = new mongoose.Schema(
  {
    NIC: { type: String, required: true, index: true },

    period_start_date: { type: Date, required: true, index: true },
    period_end_date: { type: Date, default: null },

    notes: { type: String, default: "" },

    // Soft delete
    is_deleted: { type: Boolean, default: false, index: true },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.CycleTracker || mongoose.model("CycleTracker", cycleTrackerSchema);
