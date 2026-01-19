function HistoryPanel({ dailyLogs = [], cycleTrackers = [] }) {
  const logs = Array.isArray(dailyLogs) ? dailyLogs : [];
  const cycles = Array.isArray(cycleTrackers) ? cycleTrackers : [];

  const toDate = (d) => {
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return String(d || "");
    }
  };

  const getPain = (l) => l?.pain_level ?? l?.painLevel ?? 0;

  const getSymptoms = (l) => {
    const s = l?.symptoms;
    if (Array.isArray(s)) return s;
    if (typeof s === "string" && s.trim()) return s.split(",").map(x => x.trim()).filter(Boolean);
    return [];
  };

  const getCycleStart = (c) => c?.period_start ?? c?.periodStart ?? c?.start_date ?? c?.startDate;
  const getCycleEnd = (c) => c?.period_end ?? c?.periodEnd ?? c?.end_date ?? c?.endDate;
  const getPeriodLength = (c) => c?.period_length ?? c?.periodLength;

  return (
    <div style={styles.wrap}>
      <h3 style={styles.title}>Your History 📚</h3>

      <div style={styles.grid}>
        {/* ----------------- CYCLES ----------------- */}
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>Cycle History</h4>

          {cycles.length === 0 ? (
            <p style={styles.muted}>No cycle entries yet.</p>
          ) : (
            cycles
              .slice()
              .sort((a, b) => new Date(getCycleStart(b)) - new Date(getCycleStart(a)))
              .map((c, idx) => {
                const start = getCycleStart(c);
                const end = getCycleEnd(c);
                const len = getPeriodLength(c);

                return (
                  <div key={c?._id || c?.id || `${start}-${idx}`} style={styles.row}>
                    <div style={{ flex: 1 }}>
                      <div style={styles.rowMain}>
                        {start ? toDate(start) : "Unknown start"} → {end ? toDate(end) : "Unknown end"}
                      </div>
                      {len != null && (
                        <div style={styles.rowSub}>Period length: {len} days</div>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* ----------------- DAILY LOGS ----------------- */}
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>Daily Log History</h4>

          {logs.length === 0 ? (
            <p style={styles.muted}>No daily logs yet.</p>
          ) : (
            logs
              .slice()
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((l, idx) => {
                const symptoms = getSymptoms(l);
                const pain = getPain(l);

                return (
                  <div key={l?._id || l?.id || `${l?.date}-${idx}`} style={styles.row}>
                    <div style={{ flex: 1 }}>
                      <div style={styles.rowMain}>
                        {l?.date ? toDate(l.date) : "Unknown date"} • Pain: {pain}/5 • Flow:{" "}
                        {l?.flow || "N/A"}
                      </div>
                      <div style={styles.rowSub}>
                        {symptoms.length > 0 ? `Symptoms: ${symptoms.join(", ")}` : "No symptoms"}
                        {l?.mood ? ` • Mood: ${l.mood}` : ""}
                      </div>
                      {l?.notes ? (
                        <div style={{ ...styles.rowSub, marginTop: "6px" }}>
                          Notes: {l.notes}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { marginTop: "1rem", maxWidth: "1050px" },
  title: { color: "#7b2cbf", marginBottom: "0.8rem" },
  muted: { color: "#6c757d" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  card: {
    background: "linear-gradient(180deg, #ffffff, #fff6fb)",
    border: "1px solid #f1d5ff",
    borderRadius: "16px",
    padding: "1.25rem",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },
  cardTitle: { marginTop: 0, marginBottom: "0.9rem", color: "#b5179e" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "10px",
    borderRadius: "12px",
    background: "#fff",
    border: "1px solid rgba(241, 213, 255, 0.9)",
    marginBottom: "0.7rem",
    gap: "12px",
  },
  rowMain: { fontWeight: "700", color: "#3c096c" },
  rowSub: { fontSize: "13px", marginTop: "4px", color: "#333" },
};

export default HistoryPanel;
