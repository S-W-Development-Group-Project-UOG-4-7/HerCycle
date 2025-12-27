import { useEffect, useState } from "react";
import { apiGet, apiDelete } from "../services/api";

function HistoryPanel() {
  const [cycles, setCycles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const c = await apiGet("/api/cycles");
      const l = await apiGet("/api/daily-logs");
      setCycles(Array.isArray(c) ? c : c.cycles || []);
      setLogs(Array.isArray(l) ? l : l.logs || []);
    } catch (e) {
      setError("Could not load history (server error).");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteCycle = async (id) => {
    if (!confirm("Delete this cycle entry?")) return;
    try {
      await apiDelete(`/api/cycles/${id}`);
      load();
    } catch {
      alert("Failed to delete cycle.");
    }
  };

  const deleteLog = async (id) => {
    if (!confirm("Delete this daily log?")) return;
    try {
      await apiDelete(`/api/daily-logs/${id}`);
      load();
    } catch {
      alert("Failed to delete log.");
    }
  };

  return (
    <div style={styles.wrap}>
      <h3 style={styles.title}>Your History 📚</h3>

      {loading && <p style={styles.muted}>Loading…</p>}
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>Cycle History</h4>

          {cycles.length === 0 ? (
            <p style={styles.muted}>No cycle entries yet.</p>
          ) : (
            cycles
              .slice()
              .sort((a, b) => new Date(b.periodStart) - new Date(a.periodStart))
              .map((c) => (
                <div key={c._id} style={styles.row}>
                  <div>
                    <div style={styles.rowMain}>
                      {new Date(c.periodStart).toLocaleDateString()} →{" "}
                      {new Date(c.periodEnd).toLocaleDateString()}
                    </div>
                    <div style={styles.rowSub}>Period length: {c.periodLength} days</div>
                  </div>

                  <button style={styles.dangerBtn} onClick={() => deleteCycle(c._id)}>
                    Delete
                  </button>
                </div>
              ))
          )}
        </div>

        <div style={styles.card}>
          <h4 style={styles.cardTitle}>Daily Log History</h4>

          {logs.length === 0 ? (
            <p style={styles.muted}>No daily logs yet.</p>
          ) : (
            logs
              .slice()
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((l) => (
                <div key={l._id} style={styles.row}>
                  <div>
                    <div style={styles.rowMain}>
                      {new Date(l.date).toLocaleDateString()} • Pain: {l.painLevel}/5 • Flow:{" "}
                      {l.flow}
                    </div>
                    <div style={styles.rowSub}>
                      {Array.isArray(l.symptoms) && l.symptoms.length > 0
                        ? `Symptoms: ${l.symptoms.join(", ")}`
                        : "No symptoms"}
                    </div>
                  </div>

                  <button style={styles.dangerBtn} onClick={() => deleteLog(l._id)}>
                    Delete
                  </button>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    marginTop: "1rem",
    maxWidth: "1050px",
  },
  title: { color: "#7b2cbf", marginBottom: "0.8rem" },
  muted: { color: "#6c757d" },
  error: { color: "#d00000" },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  card: {
    background: "linear-gradient(180deg, #ffffff, #fff6fb)",
    border: "1px solid #f1d5ff",
    borderRadius: "16px",
    padding: "1.25rem",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: "0.9rem",
    color: "#b5179e",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    borderRadius: "12px",
    background: "#fff",
    border: "1px solid rgba(241, 213, 255, 0.9)",
    marginBottom: "0.7rem",
    gap: "12px",
  },
  rowMain: { fontWeight: "700", color: "#3c096c" },
  rowSub: { fontSize: "13px", marginTop: "4px" },
  dangerBtn: {
    border: "none",
    background: "rgba(255, 77, 109, 0.16)",
    color: "#b00020",
    padding: "8px 10px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },
};

export default HistoryPanel;
