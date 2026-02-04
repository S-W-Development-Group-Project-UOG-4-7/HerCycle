// client/src/utils/cycleSummary.js

function toMidnight(d) {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return null;
  x.setHours(0, 0, 0, 0);
  return x;
}

function diffDays(a, b) {
  // a - b in whole days
  return Math.round((a - b) / 86400000);
}

// Internal helper: pick the same last period start consistently
function pickLastPeriodStart(cycleProfile, cycleTrackers = []) {
  const trackerStarts = (Array.isArray(cycleTrackers) ? cycleTrackers : [])
    .map((t) => t?.period_start_date)
    .filter(Boolean)
    .map((d) => new Date(d))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => b - a); // latest first

  const profileStartRaw =
    cycleProfile?.last_period_start ?? cycleProfile?.lastPeriodStart;
  const profileStart = profileStartRaw ? new Date(profileStartRaw) : null;

  const lastStart =
    trackerStarts[0] ||
    (profileStart && !Number.isNaN(profileStart.getTime()) ? profileStart : null);

  return lastStart ? toMidnight(lastStart) : null;
}

export function getCycleSummary(cycleProfile, cycleTrackers = [], today = new Date()) {
  const cycleLen =
    Number(cycleProfile?.cycle_length ?? cycleProfile?.cycleLength ?? 28) || 28;

  const periodLen =
    Number(cycleProfile?.period_length ?? cycleProfile?.periodLength ?? 5) || 5;

  const t0 = toMidnight(today);
  const lastStartMidnight = pickLastPeriodStart(cycleProfile, cycleTrackers);

  // Keep return shape consistent
  if (!t0 || !lastStartMidnight) {
    return {
      hasData: false,
      currentPhase: null,
      currentCycleDay: null,
      daysUntilNextPeriod: null,
      nextPeriodDate: null,
      lastPeriodStart: null,
    };
  }

  const diff = diffDays(t0, lastStartMidnight); // 0+
  const cycleDay = diff + 1; // ✅ NO MODULO (no fake wrap)

  // Phase model (NO WRAP):
  // If past expected cycle length, mark as Late (but still return numbers)
  let phase = "Luteal";

  if (cycleDay > cycleLen) {
    phase = "Late";
  } else {
    const ovulationDay = Math.max(1, cycleLen - 14);
    const ovuStart = Math.max(1, ovulationDay - 1);
    const ovuEnd = Math.min(cycleLen, ovulationDay + 1);

    if (cycleDay >= 1 && cycleDay <= periodLen) phase = "Menstrual";
    else if (cycleDay >= ovuStart && cycleDay <= ovuEnd) phase = "Ovulatory";
    else if (cycleDay > periodLen && cycleDay < ovuStart) phase = "Follicular";
    else phase = "Luteal";
  }

  // This becomes NEGATIVE if late, which your UI already supports ("X days late")
  const daysUntilNext = cycleLen - cycleDay + 1;

  // Keep a date even if it's in the past (safe + consistent)
  const nextDate = new Date(t0);
  nextDate.setDate(nextDate.getDate() + daysUntilNext);
  nextDate.setHours(0, 0, 0, 0);

  return {
    hasData: true,
    currentPhase: phase,
    currentCycleDay: cycleDay,
    daysUntilNextPeriod: daysUntilNext,
    nextPeriodDate: nextDate,
    lastPeriodStart: lastStartMidnight,
  };
}

/**
 * cycleTrackers: array of logs containing at least period_start_date
 * returns: { avgCycleLength, lastStart, predictedNextStart, daysToNext, ...meta }
 */
export function getCycleAveragesAndPrediction(cycleTrackers = []) {
  const starts = (Array.isArray(cycleTrackers) ? cycleTrackers : [])
    .map((t) => t?.period_start_date)
    .filter(Boolean)
    .map(toMidnight)
    .filter(Boolean)
    .sort((a, b) => a - b);

  if (starts.length < 2) {
    const lastStart = starts.length === 1 ? starts[0] : null;
    return {
      avgCycleLength: null,
      lastStart,
      predictedNextStart: null,
      daysToNext: null,
      cycleCount: 0,
      variabilityDays: null,
      isIrregular: false,
      confidence: "low",
    };
  }

  const lengths = [];
  for (let i = 1; i < starts.length; i++) {
    const d = diffDays(starts[i], starts[i - 1]);
    if (d > 0 && d <= 120) lengths.push(d);
  }

  if (lengths.length === 0) {
    return {
      avgCycleLength: null,
      lastStart: starts[starts.length - 1],
      predictedNextStart: null,
      daysToNext: null,
      cycleCount: 0,
      variabilityDays: null,
      isIrregular: false,
      confidence: "low",
    };
  }

  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const avgRounded = Math.round(avg);

  const min = Math.min(...lengths);
  const max = Math.max(...lengths);
  const variabilityDays = max - min;

  const isIrregular = variabilityDays > 7;

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
    cycleCount: lengths.length,
    variabilityDays,
    isIrregular,
    confidence,
  };
}

export function getCycleSummaryUsingAverage(
  cycleProfile,
  cycleTrackers = [],
  today = new Date()
) {
  const base = getCycleSummary(cycleProfile, cycleTrackers, today);
  const pred = getCycleAveragesAndPrediction(cycleTrackers);

  // Fallback first: if no base data, just return base (consistent)
  if (!base?.hasData) {
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

  // Use average only if we have computed avg
  if (pred?.avgCycleLength && base?.lastPeriodStart) {
    const effectiveCycleLen = pred.avgCycleLength;

    const t0 = toMidnight(today);

    // Predict next period based on SAME anchor date (base.lastPeriodStart)
    const predictedNextStart = new Date(base.lastPeriodStart);
    predictedNextStart.setDate(predictedNextStart.getDate() + effectiveCycleLen);
    predictedNextStart.setHours(0, 0, 0, 0);

    const daysToNext = t0 ? diffDays(predictedNextStart, t0) : null;

    // ✅ Late should be based on average cycle length (when usedAverage=true)
    const cycleDay = base.currentCycleDay;
    const isLate = typeof cycleDay === "number" && cycleDay > effectiveCycleLen;

    // ✅ If NOT late, recompute phase using effectiveCycleLen (so it won't stay "Late")
    let phase = base.currentPhase;
    if (isLate) {
      phase = "Late";
    } else {
      const periodLen =
        Number(cycleProfile?.period_length ?? cycleProfile?.periodLength ?? 5) || 5;

      const ovulationDay = Math.max(1, effectiveCycleLen - 14);
      const ovuStart = Math.max(1, ovulationDay - 1);
      const ovuEnd = Math.min(effectiveCycleLen, ovulationDay + 1);

      if (cycleDay >= 1 && cycleDay <= periodLen) phase = "Menstrual";
      else if (cycleDay >= ovuStart && cycleDay <= ovuEnd) phase = "Ovulatory";
      else if (cycleDay > periodLen && cycleDay < ovuStart) phase = "Follicular";
      else phase = "Luteal";
    }

    return {
      ...base,
      currentPhase: phase,
      avgCycleLength: effectiveCycleLen,
      nextPeriodDate: predictedNextStart,
      daysUntilNextPeriod: daysToNext,
      usedAverage: true,

      cycleCount: pred.cycleCount,
      variabilityDays: pred.variabilityDays,
      isIrregular: pred.isIrregular,
      confidence: pred.confidence,
    };
  }

  // ✅ IMPORTANT: always return something
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

