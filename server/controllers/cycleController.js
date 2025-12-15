const Cycle = require("../models/Cycle");

const daysBetween = (start, end) => {
  const ms = new Date(end) - new Date(start);
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
};

exports.addCycle = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { periodStart, periodEnd } = req.body;

    if (!periodStart || !periodEnd) {
      return res.status(400).json({ message: "periodStart and periodEnd are required" });
    }

    const pStart = new Date(periodStart);
    const pEnd = new Date(periodEnd);

    if (pEnd < pStart) {
      return res.status(400).json({ message: "periodEnd cannot be before periodStart" });
    }

    const periodLength = daysBetween(pStart, pEnd);

    // cycleLength is calculated later once next cycle exists, so keep optional
    const cycle = await Cycle.create({
      userId,
      periodStart: pStart,
      periodEnd: pEnd,
      periodLength,
    });

    res.status(201).json(cycle);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCycles = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cycles = await Cycle.find({ userId }).sort({ periodStart: -1 });
    res.json(cycles);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
