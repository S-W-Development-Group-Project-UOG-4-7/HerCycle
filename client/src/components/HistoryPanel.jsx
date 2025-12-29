import { useEffect, useState } from "react";
import { apiGet, apiDelete, apiPut, apiPost } from "../services/api";

function HistoryPanel() {
  const [cycles, setCycles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Cycle edit state
  const [editCycleId, setEditCycleId] = useState(null);
  const [cycleStart, setCycleStart] = useState("");
  const [cycleEnd, setCycleEnd] = useState("");

  // Daily log edit state
  const [editLogId, setEditLogId] = useState(null);
  const [logForm, setLogForm] = useState({
    date: "",
    flow: "None",
    painLevel: 0,
    mood: "",
    symptomsText: "",
    sleepHours: "",
    energyLevel: "",
    notes: "",
  });

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

  // --------- Cycle actions ----------
  const startEditCycle = (c) => {
    setEditCycleId(c._id);
    setCycleStart(new Date(c.periodStart).toISOString().slice(0, 10));
    setCycleEnd(new Date(c.periodEnd).toISOString().slice(0, 10));
  };

  const cancelEditCycle = () => {
    setEditCycleId(null);
    setCycleStart("");
    setCycleEnd("");
  };

  const saveEditCycle = async () => {
    try {
      await apiPut(`/api/cycles/${editCycleId}`, {
        periodStart: cycleStart,
        periodEnd: cycleEnd,
      });
      cancelEditCycle();
      load();
    } catch (e) {
      alert(e.message || "Failed to update cycle.");
    }
  };

  const deleteCycle = async (id) => {
    if (!confirm("Delete this cycle entry?")) return;
    try {
      await apiDelete(`/api/cycles/${id}`);
      load();
    } catch (e) {
      alert("Failed to delete cycle.");
    }
  };

  // --------- Daily log actions ----------
  const startEditLog = (l) => {
    setEditLogId(l._id);
    setLogForm({
      date: new Date(l.date).toISOString().slice(0, 10),
      flow: l.flow || "None",
      painLevel: l.painLevel ?? 0,
      mood: l.mood || "",
      symptomsText: Array.isArray(l.symptoms) ? l.symptoms.join(", ") : "",
      sleepHours: l.sleepHours ?? "",
      energyLevel: l.energyLevel ?? "",
      notes: l.notes || "",
    });
  };

  const cancelEditLog = () => {
    setEditLogId(null);
    setLogForm({
      date: "",
      flow: "None",
      painLevel: 0,
      mood: "",
      symptomsText: "",
      sleepHours: "",
      energyLevel: "",
      notes: "",
    });
  };

  const saveEditLog = async () => {
    try {
      const symptoms = logForm.symptomsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Uses your POST upsert route (create or update by date)
      await apiPost("/api/daily-logs", {
        date: logForm.date,
        flow: logForm.flow,
        painLevel: Number(logForm.painLevel),
        mood: logForm.mood,
        symptoms,
        sleepHours: logForm.sleepHours === "" ? null : Number(logForm.sleepHours),
        energyLevel: logForm.energyLevel === "" ? null : Number(logForm.energyLevel),
        notes: logForm.notes,
      });

      cancelEditLog();
      load();
    } catch (e) {
      alert(e.message || "Failed to update log.");
    }
  };

  const deleteLog = async (id) => {
    if (!confirm("Delete this daily log?")) return;
    try {
      await apiDelete(`/api/daily-logs/${id}`);
      load();
    } catch (e) {
      alert("Failed to delete log.");
    }
  };

  return (
    <div style={styles.wrap}>
      <h3 style={styles.title}>Your History 📚</h3>

      {loading && <p style={styles.muted}>Loading…</p>}
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.grid}>
        {/* ----------------- CYCLES ----------------- */}
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
                  <div style={{ flex: 1 }}>
                    {editCycleId === c._id ? (
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <div>
                          <div style={styles.smallLabel}>Start</div>
                          <input
                            type="date"
                            value={cycleStart}
                            onChange={(e) => setCycleStart(e.target.value)}
                            style={styles.input}
                          />
                        </div>
                        <div>
                          <div style={styles.smallLabel}>End</div>
                          <input
                            type="date"
                            value={cycleEnd}
                            onChange={(e) => setCycleEnd(e.target.value)}
                            style={styles.input}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={styles.rowMain}>
                          {new Date(c.periodStart).toLocaleDateString()} →{" "}
                          {new Date(c.periodEnd).toLocaleDateString()}
                        </div>
                        <div style={styles.rowSub}>Period length: {c.periodLength} days</div>
                      </>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {editCycleId === c._id ? (
                      <>
                        <button style={styles.softBtn} onClick={saveEditCycle}>
                          Save
                        </button>
                        <button style={styles.softBtn2} onClick={cancelEditCycle}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button style={styles.softBtn} onClick={() => startEditCycle(c)}>
                          Edit
                        </button>
                        <button style={styles.dangerBtn} onClick={() => deleteCycle(c._id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
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
              .map((l) => (
                <div key={l._id} style={styles.row}>
                  <div style={{ flex: 1 }}>
                    {editLogId === l._id ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <div style={styles.smallLabel}>Date</div>
                          <input type="date" value={logForm.date} disabled style={styles.input} />
                        </div>

                        <div>
                          <div style={styles.smallLabel}>Flow</div>
                          <select
                            value={logForm.flow}
                            onChange={(e) => setLogForm({ ...logForm, flow: e.target.value })}
                            style={styles.input}
                          >
                            <option>None</option>
                            <option>Light</option>
                            <option>Medium</option>
                            <option>Heavy</option>
                          </select>
                        </div>

                        <div>
                          <div style={styles.smallLabel}>Pain (0–5)</div>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            value={logForm.painLevel}
                            onChange={(e) => setLogForm({ ...logForm, painLevel: e.target.value })}
                            style={styles.input}
                          />
                        </div>

                        <div>
                          <div style={styles.smallLabel}>Mood</div>
                          <input
                            value={logForm.mood}
                            onChange={(e) => setLogForm({ ...logForm, mood: e.target.value })}
                            placeholder="Happy / Sad / Irritable..."
                            style={styles.input}
                          />
                        </div>

                        <div style={{ gridColumn: "1 / -1" }}>
                          <div style={styles.smallLabel}>Symptoms (comma separated)</div>
                          <input
                            value={logForm.symptomsText}
                            onChange={(e) =>
                              setLogForm({ ...logForm, symptomsText: e.target.value })
                            }
                            placeholder="cramps, bloating, headache"
                            style={styles.input}
                          />
                        </div>

                        <div>
                          <div style={styles.smallLabel}>Sleep Hours</div>
                          <input
                            type="number"
                            value={logForm.sleepHours}
                            onChange={(e) =>
                              setLogForm({ ...logForm, sleepHours: e.target.value })
                            }
                            style={styles.input}
                          />
                        </div>

                        <div>
                          <div style={styles.smallLabel}>Energy (0–10)</div>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={logForm.energyLevel}
                            onChange={(e) =>
                              setLogForm({ ...logForm, energyLevel: e.target.value })
                            }
                            style={styles.input}
                          />
                        </div>

                        <div style={{ gridColumn: "1 / -1" }}>
                          <div style={styles.smallLabel}>Notes</div>
                          <input
                            value={logForm.notes}
                            onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                            placeholder="Any notes…"
                            style={styles.input}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={styles.rowMain}>
                          {new Date(l.date).toLocaleDateString()} • Pain: {l.painLevel}/5 • Flow:{" "}
                          {l.flow}
                        </div>
                        <div style={styles.rowSub}>
                          {Array.isArray(l.symptoms) && l.symptoms.length > 0
                            ? `Symptoms: ${l.symptoms.join(", ")}`
                            : "No symptoms"}
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {editLogId === l._id ? (
                      <>
                        <button style={styles.softBtn} onClick={saveEditLog}>
                          Save
                        </button>
                        <button style={styles.softBtn2} onClick={cancelEditLog}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button style={styles.softBtn} onClick={() => startEditLog(l)}>
                          Edit
                        </button>
                        <button style={styles.dangerBtn} onClick={() => deleteLog(l._id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
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
  error: { color: "#d00000" },
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
  softBtn: {
    border: "none",
    background: "rgba(157, 78, 221, 0.14)",
    color: "#5a189a",
    padding: "8px 10px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },
  softBtn2: {
    border: "none",
    background: "rgba(255, 133, 192, 0.16)",
    color: "#b5179e",
    padding: "8px 10px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },
  input: {
    padding: "8px 10px",
    borderRadius: "10px",
    border: "1px solid #e7c6ff",
    outline: "none",
    minWidth: "170px",
  },
  smallLabel: { fontSize: "12px", color: "#6c757d", marginBottom: "4px" },
};

export default HistoryPanel;
