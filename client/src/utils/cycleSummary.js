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
