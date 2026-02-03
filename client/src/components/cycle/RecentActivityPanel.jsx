import { useEffect, useState } from "react";
import { upsertCycleProfile, addCycleTracker } from "../../services/cycleApi";


const BASE_URL = "http://localhost:5000";

async function apiGetWithToken(path) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function formatDate(d) {
  if (!d) return "--";
  return new Date(d).toLocaleDateString();
}

function RecentActivityPanel() {
  const [cycles, setCycles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [c, l] = await Promise.all([
          apiGetWithToken("/api/cycles"),
          apiGetWithToken("/api/daily-logs"),
        ]);

        setCycles(Array.isArray(c) ? c.slice(0, 3) : []);
        setLogs(Array.isArray(l) ? l.slice(0, 3) : []);
      } catch (e) {
        setError("Could not load recent activity.");
      }
    };

    load();
  }, []);

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>Recent Activity 🌸</h3>
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.grid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>Recent Cycles</span>
            <span style={styles.badgePurple}>Cycle</span>
          </div>

          {cycles.length === 0 ? (
            <p style={styles.muted}>No cycles logged yet.</p>
          ) : (
            cycles.map((c) => (
              <div key={c._id} style={styles.row}>
                <span>
                  {formatDate(c.periodStart)} → {formatDate(c.periodEnd)}
                </span>
                <span style={styles.chip}>
                  {c.periodLength ? `${c.periodLength} days` : "--"}
                </span>
              </div>
            ))
          )}
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>Recent Daily Logs</span>
            <span style={styles.badgePink}>Log</span>
          </div>

          {logs.length === 0 ? (
            <p style={styles.muted}>No daily logs yet.</p>
          ) : (
            logs.map((l) => (
              <div key={l._id} style={styles.row}>
                <span>{formatDate(l.date)}</span>
                <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={styles.chipSoft}>
                    {l.flow ? `Flow: ${l.flow}` : "Flow: --"}
                  </span>
                  <span style={{ ...styles.dot, opacity: 0.9 }} />
                  <span style={styles.chipSoft}>
                    {typeof l.painLevel === "number" ? `Pain: ${l.painLevel}` : "Pain: --"}
                  </span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: "1.5rem",
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #f1d5ff",
    padding: "1.25rem",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    maxWidth: "980px",
  },
  title: { color: "#7b2cbf", marginTop: 0 },
  error: { color: "#d00000" },
  muted: { color: "#6c757d", fontSize: "14px" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  },
  panel: {
    background: "linear-gradient(180deg, #ffffff, #fff6fb)",
    border: "1px solid #f6e7ff",
    borderRadius: "14px",
    padding: "1rem",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  panelTitle: { fontWeight: 800, color: "#5a189a" },

  badgePurple: {
    background: "rgba(157, 78, 221, 0.16)",
    border: "1px solid rgba(157, 78, 221, 0.25)",
    color: "#5a189a",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  badgePink: {
    background: "rgba(255, 93, 143, 0.14)", // soft red/pink
    border: "1px solid rgba(255, 93, 143, 0.22)",
    color: "#b5179e",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "10px 0",
    borderBottom: "1px dashed #f1d5ff",
    fontSize: "14px",
  },
  chip: {
    background: "rgba(224, 170, 255, 0.22)",
    border: "1px solid rgba(224, 170, 255, 0.35)",
    color: "#5a189a",
    padding: "5px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  chipSoft: {
    background: "#fff0f8",
    border: "1px solid #f6d7ea",
    color: "#7b2cbf",
    padding: "5px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#ff5d8f", // soft red accent
    display: "inline-block",
  },
};

export default RecentActivityPanel;
