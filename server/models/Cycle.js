const mongoose = require("mongoose");

const cycleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },

    // optional but useful for faster calculations
    cycleLength: { type: Number },  // days
    periodLength: { type: Number }, // days
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cycle", cycleSchema);
