import { useMemo } from "react";

function InsightsPanel({ cycleProfile, dailyLogs = [] }) {
  const logs = Array.isArray(dailyLogs) ? dailyLogs : [];

  const insights = useMemo(() => {
    const items = [];

    const cycleLen = cycleProfile?.cycle_length ?? cycleProfile?.cycleLength;
    const periodLen = cycleProfile?.period_length ?? cycleProfile?.periodLength;
    const lastStart = cycleProfile?.last_period_start ?? cycleProfile?.lastPeriodStart;

    // --- Profile based ---
    if (cycleLen) {
      items.push({
        title: "Cycle length",
        detail: `Your set cycle length is ${cycleLen} days.`,
      });
    }
    if (periodLen) {
      items.push({
        title: "Period length",
        detail: `Your set period length is ${periodLen} days.`,
      });
    }
    if (lastStart) {
      const d = new Date(lastStart);
      if (!isNaN(d.getTime())) {
        items.push({
          title: "Last period start",
          detail: `Last recorded period start: ${d.toLocaleDateString()}.`,
        });
      }
    }

    // --- Logs based (last 14 entries) ---
    const recent = logs
      .slice()
      .filter((l) => l?.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 14);

    if (recent.length === 0) {
      items.push({
        title: "Start logging to unlock insights",
        detail: "Add a few daily logs (mood/symptoms/pain) and you’ll see patterns here.",
      });
      return items;
    }

    const painVals = recent
      .map((l) => l?.pain_level ?? l?.painLevel)
      .filter((v) => typeof v === "number" && !Number.isNaN(v));

    if (painVals.length > 0) {
      const avgPain = painVals.reduce((a, b) => a + b, 0) / painVals.length;
      items.push({
        title: "Average pain (recent)",
        detail: `Your average pain level over the last ${painVals.length} logs is ${avgPain.toFixed(
          1
        )}/5.`,
      });
    }

    const moodCounts = {};
    recent.forEach((l) => {
      const m = (l?.mood || "").trim();
      if (!m) return;
      moodCounts[m] = (moodCounts[m] || 0) + 1;
    });
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    if (topMood) {
      items.push({
        title: "Most common mood (recent)",
        detail: `Your most logged mood recently is “${topMood[0]}”.`,
      });
    }

    const symptomCounts = {};
    recent.forEach((l) => {
      const s = l?.symptoms;
      const arr = Array.isArray(s)
        ? s
        : typeof s === "string"
        ? s.split(",").map((x) => x.trim()).filter(Boolean)
        : [];
      arr.forEach((sym) => {
        symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
      });
    });
    const topSymptom = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0];
    if (topSymptom) {
      items.push({
        title: "Most common symptom (recent)",
        detail: `The symptom you logged most often recently is “${topSymptom[0]}”.`,
      });
    }

    // If nothing was added (very unlikely), show a fallback
    if (items.length === 0) {
      items.push({
        title: "Insights",
        detail: "Keep logging regularly to see patterns and trends.",
      });
    }

    return items;
  }, [cycleProfile, logs]);

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>Insights ✨</h3>

      {insights.map((it, idx) => (
        <div key={idx} style={styles.card}>
          <p style={styles.cardTitle}>{it.title}</p>
          <p style={styles.cardDetail}>{it.detail}</p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: "2rem",
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "14px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
    maxWidth: "700px",
  },
  title: { color: "#7b2cbf", marginBottom: "1rem" },
  card: {
    border: "1px solid #f1d5ff",
    padding: "1rem",
    borderRadius: "12px",
    marginBottom: "0.8rem",
    background: "#fff7fd",
  },
  cardTitle: { fontWeight: "700", marginBottom: "0.3rem", color: "#b5179e" },
  cardDetail: { margin: 0, fontSize: "14px" },
};

export default InsightsPanel;
