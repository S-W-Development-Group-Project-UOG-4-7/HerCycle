const Cycle = require("../models/Cycle");

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysDiff(a, b) {
  return Math.floor((b - a) / MS_PER_DAY);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    // oldest -> newest for cycle-length calculation
    const cycles = await Cycle.find({ userId }).sort({ periodStart: 1 });

    if (cycles.length === 0) {
      return res.json({
        hasData: false,
        message: "No cycle data yet",
      });
    }

    // Avg period length
    const periodLengths = cycles
      .map((c) => c.periodLength)
      .filter((x) => typeof x === "number");
    const avgPeriodLength =
      periodLengths.length > 0
        ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
        : 5;

    // Avg cycle length from gaps between consecutive period starts
    const cycleLengths = [];
    for (let i = 1; i < cycles.length; i++) {
      const prev = new Date(cycles[i - 1].periodStart);
      const curr = new Date(cycles[i].periodStart);
      const gap = daysDiff(prev, curr);
      if (gap > 0 && gap < 60) cycleLengths.push(gap);
    }

    const avgCycleLength =
      cycleLengths.length > 0
        ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
        : 28;

    const lastCycle = cycles[cycles.length - 1];
    const lastPeriodStart = new Date(lastCycle.periodStart);

    const today = new Date();
    const currentCycleDay = daysDiff(lastPeriodStart, today) + 1; // Day 1 = period start day

    const nextPeriodDate = addDays(lastPeriodStart, avgCycleLength);
    const daysUntilNextPeriod = daysDiff(today, nextPeriodDate);

    // Simple phase estimation (non-AI)
    const ovulationDay = Math.max(10, Math.round(avgCycleLength - 14)); // common approximation
    let currentPhase = "Luteal";

    if (currentCycleDay <= avgPeriodLength) currentPhase = "Menstrual";
    else if (currentCycleDay < ovulationDay - 1) currentPhase = "Follicular";
    else if (currentCycleDay <= ovulationDay + 1) currentPhase = "Ovulatory";
    else currentPhase = "Luteal";

    return res.json({
      hasData: true,
      avgCycleLength,
      avgPeriodLength,
      lastPeriodStart,
      nextPeriodDate,
      daysUntilNextPeriod,
      currentCycleDay,
      currentPhase,
      totalCyclesLogged: cycles.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
