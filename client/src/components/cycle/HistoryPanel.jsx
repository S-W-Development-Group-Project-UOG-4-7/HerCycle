import { useState } from "react";

function HistoryPanel({
  dailyLogs = [],
  cycleTrackers = [],
  onDeleteDailyLog,         // async (logId) => void
  onDeleteCycleTracker,     // async (trackerId) => void
  usePopupMessages = false, // if true => uses window.alert
}) {
  const logs = Array.isArray(dailyLogs) ? dailyLogs : [];
  const cycles = Array.isArray(cycleTrackers) ? cycleTrackers : [];

  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const notify = (type, text) => {
    if (usePopupMessages && typeof window !== "undefined") {
      window.alert(text);
      return;
    }
    if (type === "error") {
      setError(text);
      setMessage("");
    } else {
      setMessage(text);
      setError("");
    }
  };

  const confirmAction = (text) => {
    if (typeof window === "undefined") return true; // SSR safety
    return window.confirm(text);
  };

  const toDate = (d) => {
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return String(d || "");
      return dt.toLocaleDateString();
    } catch {
      return String(d || "");
    }
  };

  const toTime = (d) => {
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? 0 : dt.getTime();
  };

  const getPain = (l) => l?.pain_level ?? l?.painLevel ?? 0;

  const getSymptoms = (l) => {
    const s = l?.symptoms;
    if (Array.isArray(s)) return s;
    if (typeof s === "string" && s.trim())
      return s.split(",").map((x) => x.trim()).filter(Boolean);
    return [];
  };

  // ✅ IMPORTANT FIX: backend uses period_start_date / period_end_date
  const getCycleStart = (c) =>
    c?.period_start_date ??
    c?.period_start ??
    c?.periodStart ??
    c?.start_date ??
    c?.startDate;

  const getCycleEnd = (c) =>
    c?.period_end_date ??
    c?.period_end ??
    c?.periodEnd ??
    c?.end_date ??
    c?.endDate;

  const getPeriodLength = (c) => c?.period_length ?? c?.periodLength;

  const getId = (x) => x?._id || x?.id || null;

  const handleDeleteCycle = async (c) => {
    setMessage("");
    setError("");

    const id = getId(c);
    if (!id) return notify("error", "Cannot delete: missing id for this cycle entry.");

    if (typeof onDeleteCycleTracker !== "function") {
      return notify("error", "Delete not wired yet (onDeleteCycleTracker not provided).");
    }

    const ok = confirmAction("Delete this cycle entry? This cannot be undone.");
    if (!ok) return;

    try {
      setBusyId(id);
      await onDeleteCycleTracker(id);
      notify("success", "Cycle entry deleted.");
    } catch (e) {
      notify("error", e?.message || "Failed to delete cycle entry.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteLog = async (l) => {
    setMessage("");
    setError("");

    const id = getId(l);
    if (!id) return notify("error", "Cannot delete: missing id for this daily log.");

    if (typeof onDeleteDailyLog !== "function") {
      return notify("error", "Delete not wired yet (onDeleteDailyLog not provided).");
    }

    const ok = confirmAction("Delete this daily log? This cannot be undone.");
    if (!ok) return;

    try {
      setBusyId(id);
      await onDeleteDailyLog(id);
      notify("success", "Daily log deleted.");
    } catch (e) {
      notify("error", e?.message || "Failed to delete daily log.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={styles.wrap}>
      {/* Inline message area (only used if usePopupMessages = false) */}
      {!usePopupMessages && (
        <>
          {error ? <div style={styles.errorBox}>{error}</div> : null}
          {message ? <div style={styles.successBox}>{message}</div> : null}
        </>
      )}

      <div style={styles.grid}>
        {/* ----------------- CYCLES ----------------- */}
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>Cycle History</h4>

          {cycles.length === 0 ? (
            <p style={styles.muted}>No cycle entries yet.</p>
          ) : (
            cycles
              .slice()
              .sort((a, b) => toTime(getCycleStart(b)) - toTime(getCycleStart(a)))
              .map((c, idx) => {
                const start = getCycleStart(c);
                const end = getCycleEnd(c);
                const len = getPeriodLength(c);
                const id = getId(c);
                const deleting = busyId && id && busyId === id;

                return (
                  <div key={id || `${start}-${idx}`} style={styles.row}>
                    <div style={{ flex: 1 }}>
                      <div style={styles.rowMain}>
                        {start ? toDate(start) : "Unknown start"} → {end ? toDate(end) : "Unknown end"}
                      </div>
                      {len != null && <div style={styles.rowSub}>Period length: {len} days</div>}
                      {c?.notes ? (
                        <div style={{ ...styles.rowSub, marginTop: "6px" }}>Notes: {c.notes}</div>
                      ) : null}
                    </div>

                    <button
                      style={{ ...styles.delBtn, opacity: deleting ? 0.6 : 1 }}
                      disabled={deleting}
                      onClick={() => handleDeleteCycle(c)}
                      title="Delete cycle entry"
                    >
                      {deleting ? "Deleting…" : "🗑️"}
                    </button>
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
              .sort((a, b) => toTime(b?.date) - toTime(a?.date))
              .map((l, idx) => {
                const symptoms = getSymptoms(l);
                const pain = getPain(l);
                const id = getId(l);
                const deleting = busyId && id && busyId === id;

                return (
                  <div key={id || `${l?.date}-${idx}`} style={styles.row}>
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
                        <div style={{ ...styles.rowSub, marginTop: "6px" }}>Notes: {l.notes}</div>
                      ) : null}
                    </div>

                    <button
                      style={{ ...styles.delBtn, opacity: deleting ? 0.6 : 1 }}
                      disabled={deleting}
                      onClick={() => handleDeleteLog(l)}
                      title="Delete daily log"
                    >
                      {deleting ? "Deleting…" : "🗑️"}
                    </button>
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
  delBtn: {
    border: "1px solid #ffd6e7",
    background: "rgba(255, 133, 192, 0.12)",
    color: "#b5179e",
    borderRadius: "12px",
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 800,
    minWidth: 44,
  },
  errorBox: {
    background: "#ffe5e5",
    border: "1px solid #ffb3b3",
    color: "#8b0000",
    padding: "10px 12px",
    borderRadius: "12px",
    marginBottom: "12px",
    fontWeight: 700,
  },
  successBox: {
    background: "#e8fff3",
    border: "1px solid #a8f0c6",
    color: "#1b5e20",
    padding: "10px 12px",
    borderRadius: "12px",
    marginBottom: "12px",
    fontWeight: 700,
  },
};

export default HistoryPanel;
