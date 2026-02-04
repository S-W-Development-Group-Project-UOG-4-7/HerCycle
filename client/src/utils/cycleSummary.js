export function getCycleSummary(cycleProfile, cycleTrackers = [], today = new Date()) {
  const cycleLen =
    Number(cycleProfile?.cycle_length ?? cycleProfile?.cycleLength ?? 28) || 28;

  const periodLen =
    Number(cycleProfile?.period_length ?? cycleProfile?.periodLength ?? 5) || 5;

  // Pick last period start from:
  // 1) latest tracker period_start_date
  // 2) cycleProfile.last_period_start
  const trackerStarts = (Array.isArray(cycleTrackers) ? cycleTrackers : [])
    .map((t) => t?.period_start_date)
    .filter(Boolean)
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => b - a);

  const profileStartRaw = cycleProfile?.last_period_start ?? cycleProfile?.lastPeriodStart;
  const profileStart = profileStartRaw ? new Date(profileStartRaw) : null;

  let lastStart = trackerStarts[0] || (profileStart && !isNaN(profileStart.getTime()) ? profileStart : null);

  if (!lastStart) {
    return {
      hasData: false,
      currentPhase: null,
      currentCycleDay: null,
      daysUntilNextPeriod: null,
      nextPeriodDate: null,
    };
  }

  // Normalize dates to midnight to avoid timezone/hour issues
  const t0 = new Date(today);
  t0.setHours(0, 0, 0, 0);

  const s0 = new Date(lastStart);
  s0.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((t0 - s0) / 86400000); // could be 0+
  const cycleDay = (diffDays % cycleLen) + 1;

  // Simple phase model:
  // Menstrual: day 1..periodLen
  // Ovulatory: ovulationDay-1..ovulationDay+1, where ovulationDay = cycleLen - 14
  // Follicular: after menstrual until ovulatory window
  // Luteal: after ovulatory window
  const ovulationDay = Math.max(1, cycleLen - 14);
  const ovuStart = Math.max(1, ovulationDay - 1);
  const ovuEnd = Math.min(cycleLen, ovulationDay + 1);

  let phase = "Luteal";
  if (cycleDay >= 1 && cycleDay <= periodLen) phase = "Menstrual";
  else if (cycleDay >= ovuStart && cycleDay <= ovuEnd) phase = "Ovulatory";
  else if (cycleDay > periodLen && cycleDay < ovuStart) phase = "Follicular";
  else phase = "Luteal";

  const daysUntilNext = cycleLen - cycleDay + 1;
  const nextDate = new Date(t0);
  nextDate.setDate(nextDate.getDate() + daysUntilNext);

  return {
    hasData: true,
    currentPhase: phase,
    currentCycleDay: cycleDay,
    daysUntilNextPeriod: daysUntilNext,
    nextPeriodDate: nextDate,
  };
}

function toMidnight(d) {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return null;
  x.setHours(0, 0, 0, 0);
  return x;
}

function diffDays(a, b) {
  return Math.round((a - b) / 86400000);
}

/**
 * cycleTrackers: array of logs containing at least period_start_date
 * returns: { avgCycleLength, lastStart, predictedNextStart, daysToNext }
 */
export function getCycleAveragesAndPrediction(cycleTrackers = []) {
  const starts = (Array.isArray(cycleTrackers) ? cycleTrackers : [])
    .map((t) => t?.period_start_date)
    .filter(Boolean)
    .map(toMidnight)
    .filter(Boolean)
    .sort((a, b) => a - b);

  if (starts.length < 2) {
    // Not enough to compute an average cycle length
    const lastStart = starts.length === 1 ? starts[0] : null;
    return {
      avgCycleLength: null,
      lastStart,
      predictedNextStart: null,
      daysToNext: null,
    };
  }

  const lengths = [];
  for (let i = 1; i < starts.length; i++) {
    const d = diffDays(starts[i], starts[i - 1]);
    if (d > 0 && d <= 120) lengths.push(d); // guard
  }

  if (lengths.length === 0) {
    return {
      avgCycleLength: null,
      lastStart: starts[starts.length - 1],
      predictedNextStart: null,
      daysToNext: null,
    };
  }

  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const avgRounded = Math.round(avg);

  const min = Math.min(...lengths);
  const max = Math.max(...lengths);
  const variabilityDays = max - min;

  // simple, explainable rule:
  const isIrregular = variabilityDays > 7;

  // confidence based on number of usable cycles (lengths count)
  let confidence = "low";
  if (lengths.length >= 6) confidence = "high";
  else if (lengths.length >= 3) confidence = "medium";


  const lastStart = starts[starts.length - 1];
  const predictedNextStart = new Date(lastStart);
  predictedNextStart.setDate(predictedNextStart.getDate() + avgRounded);
  predictedNextStart.setHours(0, 0, 0, 0);

  const today = toMidnight(new Date());
  const daysToNext = today ? diffDays(predictedNextStart, today) : null;

  return {
    avgCycleLength: avgRounded,
    lastStart,
    predictedNextStart,
    daysToNext,

    cycleCount: lengths.length,        // how many computed cycle lengths
    variabilityDays,                   // max-min
    isIrregular,                       // variabilityDays > 7
    confidence,                        // low/medium/high
  };

}

export function getCycleSummaryUsingAverage(cycleProfile, cycleTrackers = [], today = new Date()) {
  // base summary (phase + cycle day) using profile/default cycle length
  const base = getCycleSummary(cycleProfile, cycleTrackers, today);

  // prediction from actual tracker average (if possible)
  const pred = getCycleAveragesAndPrediction(cycleTrackers);

  // If average prediction is available, override next period fields
  if (pred?.avgCycleLength && pred?.predictedNextStart) {
    // daysToNext can be negative if late; UI can show "late"
    return {
      ...base,
      avgCycleLength: pred.avgCycleLength,
      nextPeriodDate: pred.predictedNextStart,
      daysUntilNextPeriod: pred.daysToNext,
      usedAverage: true,

      cycleCount: pred.cycleCount,
      variabilityDays: pred.variabilityDays,
      isIrregular: pred.isIrregular,
      confidence: pred.confidence,
    };
  }

  // Otherwise keep base prediction
  return {
    ...base,
    avgCycleLength: null,
    usedAverage: false,

    cycleCount: null,
    variabilityDays: null,
    isIrregular: false,
    confidence: null,
  };
}
