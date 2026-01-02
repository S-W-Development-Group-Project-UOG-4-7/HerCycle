function phaseMeta(phase) {
  switch (phase) {
    case "Menstrual":
      return {
        emoji: "🩸",
        title: "Menstrual Phase",
        color: "#ff5d8f", // soft red accent
        desc: "Rest more, stay hydrated, and try gentle warmth for cramps.",
      };
    case "Follicular":
      return {
        emoji: "🌱",
        title: "Follicular Phase",
        color: "#9d4edd",
        desc: "Energy often increases—great time for planning and light workouts.",
      };
    case "Ovulatory":
      return {
        emoji: "✨",
        title: "Ovulatory Phase",
        color: "#f15bb5",
        desc: "Many feel most energetic—listen to your body and keep balanced meals.",
      };
    case "Luteal":
    default:
      return {
        emoji: "🌙",
        title: "Luteal Phase",
        color: "#7b2cbf",
        desc: "Mood and cravings may shift—prioritize sleep and steady meals.",
      };
  }
}

function PhaseCard({ summary }) {
  const hasData = summary?.hasData;
  const phase = hasData ? summary.currentPhase : null;

  const meta = phase ? phaseMeta(phase) : null;

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <div>
          <h3 style={styles.heading}>Where you are now</h3>
          <p style={styles.sub}>
            {hasData
              ? `Day ${summary.currentCycleDay} of your cycle`
              : "Log your first cycle to unlock phase tracking"}
          </p>
        </div>

        <div style={styles.badgeWrap}>
          <span style={styles.badge}>{hasData ? phase : "No data"}</span>
        </div>
      </div>

      {hasData && meta && (
        <div style={styles.phaseBox}>
          <div
            style={{
              ...styles.phaseIcon,
              borderColor: meta.color,
              background: `${meta.color}22`,
            }}
          >
            <span style={{ fontSize: "22px" }}>{meta.emoji}</span>
          </div>

          <div>
            <p style={styles.phaseTitle}>
              {meta.title} <span style={{ color: meta.color }}>•</span>{" "}
              <span style={{ fontWeight: 700 }}>{phase}</span>
            </p>
            <p style={styles.phaseDesc}>{meta.desc}</p>
          </div>
        </div>
      )}

      {hasData && (
        <div style={styles.bottomRow}>
          <div style={styles.softPill}>
            Next period:{" "}
            <span style={styles.bold}>
              {new Date(summary.nextPeriodDate).toLocaleDateString()}
            </span>
          </div>

          <div style={styles.softPill}>
            Avg cycle:{" "}
            <span style={styles.bold}>{summary.avgCycleLength} days</span>
          </div>

          <div style={styles.softPill}>
            Avg period:{" "}
            <span style={styles.bold}>{summary.avgPeriodLength} days</span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "linear-gradient(180deg, #ffffff, #fff6fb)",
    border: "1px solid #f1d5ff",
    borderRadius: "16px",
    padding: "1.25rem",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    maxWidth: "980px",
    marginTop: "1.25rem",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  heading: { margin: 0, color: "#7b2cbf" },
  sub: { margin: "6px 0 0", color: "#6c757d", fontSize: "14px" },

  badgeWrap: { display: "flex", alignItems: "center" },
  badge: {
    background: "rgba(157, 78, 221, 0.16)",
    border: "1px solid rgba(157, 78, 221, 0.25)",
    color: "#5a189a",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  phaseBox: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginTop: "1rem",
    padding: "12px",
    borderRadius: "14px",
    background: "#ffffff",
    border: "1px solid #f6e7ff",
  },
  phaseIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    border: "2px solid",
  },
  phaseTitle: { margin: 0, color: "#3c096c", fontSize: "14px" },
  phaseDesc: { margin: "6px 0 0", color: "#495057", fontSize: "14px" },

  bottomRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "1rem",
  },
  softPill: {
    background: "#fff0f8",
    border: "1px solid #f6d7ea",
    color: "#7b2cbf",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
  },
  bold: { fontWeight: 800, color: "#5a189a" },
};

export default PhaseCard;
