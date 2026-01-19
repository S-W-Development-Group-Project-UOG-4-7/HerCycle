import { useMemo, useState } from "react";

const SYMPTOMS = [
  "cramps",
  "bloating",
  "headache",
  "fatigue",
  "acne",
  "cravings",
  "mood_swings",
  "breast_tenderness",
];

const MOODS = ["happy", "calm", "stressed", "sad", "angry", "anxious"];

/**
 * Props:
 * - initialDate?: "YYYY-MM-DD"
 * - onSave: (formData) => Promise<void>
 * - saving?: boolean
 */
function DailyLogForm({ initialDate, onSave, saving = false }) {
  const defaultDate = useMemo(
    () => initialDate || new Date().toISOString().slice(0, 10),
    [initialDate]
  );

  const [date, setDate] = useState(defaultDate);
  const [flow, setFlow] = useState("none");
  const [pain_level, setPainLevel] = useState(0); // backend expects pain_level
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
  const [symptoms, setSymptoms] = useState([]);

  // Optional fields from your old UI (not required by backend)
  const [sleepHours, setSleepHours] = useState("");
  const [energyLevel, setEnergyLevel] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const painColor = (p) => {
    if (p <= 1) return "#ffb3c6";
    if (p <= 3) return "#ff5d8f";
    return "#e11d48";
  };

  const painBg = (p) => {
    const pct = (p / 5) * 100;
    const c = painColor(p);
    return `linear-gradient(to right, ${c} 0%, ${c} ${pct}%, #e9d8ff ${pct}%, #e9d8ff 100%)`;
  };

  const toggleSymptom = (s) => {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const resetForm = () => {
    setDate(defaultDate);
    setFlow("none");
    setPainLevel(0);
    setMood("");
    setSymptoms([]);
    setNotes("");
    setSleepHours("");
    setEnergyLevel("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (typeof onSave !== "function") {
      setError("Internal error: onSave is not provided.");
      return;
    }

    try {
      // Only send fields the backend is most likely to accept.
      // Keep sleepHours/energyLevel out unless your backend supports them.
      await onSave({
        date,
        flow,
        pain_level: Number(pain_level),
        mood: mood || "",
        symptoms,
        notes: notes || "",
        // If you later add backend support, you can include:
        // sleepHours: sleepHours === "" ? undefined : Number(sleepHours),
        // energyLevel: energyLevel === "" ? undefined : Number(energyLevel),
      });

      setMessage("Daily log saved successfully 🌷");
      resetForm();
    } catch (err) {
      setError(err?.message || "Failed to save daily log");
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <h3 style={styles.title}>Daily Log</h3>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <div style={styles.grid2}>
          <div>
            <label style={styles.label}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.input}
              required
              disabled={saving}
            />
          </div>

          <div>
            <label style={styles.label}>Flow</label>
            <select
              value={flow}
              onChange={(e) => setFlow(e.target.value)}
              style={styles.input}
              disabled={saving}
            >
              <option value="none">None</option>
              <option value="spotting">Spotting</option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>
        </div>

        <div style={styles.grid2}>
          <div>
            <label style={styles.label}>Pain Level (0–5)</label>
            <input
              type="range"
              min="0"
              max="5"
              value={pain_level}
              onChange={(e) => setPainLevel(e.target.value)}
              style={{ ...styles.range, background: painBg(Number(pain_level)) }}
              disabled={saving}
            />

            <div style={styles.rangeValue}>
              <span
                style={{
                  ...styles.painDot,
                  background: painColor(Number(pain_level)),
                }}
              />
              <span>{pain_level}</span>
            </div>
          </div>

          <div>
            <label style={styles.label}>Mood</label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              style={styles.input}
              disabled={saving}
            >
              <option value="">Select mood</option>
              {MOODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label style={styles.label}>Symptoms</label>
        <div style={styles.symptomWrap}>
          {SYMPTOMS.map((s) => {
            const active = symptoms.includes(s);
            return (
              <button
                type="button"
                key={s}
                onClick={() => toggleSymptom(s)}
                style={{
                  ...styles.symptomChip,
                  ...(active ? styles.symptomChipActive : {}),
                  opacity: saving ? 0.7 : 1,
                }}
                disabled={saving}
              >
                {s.replaceAll("_", " ")}
              </button>
            );
          })}
        </div>

        {/* Keep these fields (UI-only for now). They won’t be sent unless backend supports them. */}
        <div style={styles.grid2}>
          <div>
            <label style={styles.label}>Sleep Hours</label>
            <input
              type="number"
              min="0"
              max="24"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              placeholder="e.g., 7"
              style={styles.input}
              disabled={saving}
            />
          </div>

          <div>
            <label style={styles.label}>Energy Level (0–10)</label>
            <input
              type="number"
              min="0"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(e.target.value)}
              placeholder="e.g., 6"
              style={styles.input}
              disabled={saving}
            />
          </div>
        </div>

        <label style={styles.label}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes for today…"
          style={styles.textarea}
          disabled={saving}
        />

        <button type="submit" style={{ ...styles.button, opacity: saving ? 0.8 : 1 }} disabled={saving}>
          {saving ? "Saving..." : "Save Daily Log"}
        </button>
      </form>

      <p style={styles.softNote}>
        Tip: Logging even a few symptoms helps unlock better insights 💗
      </p>
    </div>
  );
}

const styles = {
  card: {
    background: "linear-gradient(180deg, #ffffff, #fff6fb)",
    border: "1px solid #f6e7ff",
    padding: "1.75rem",
    borderRadius: "18px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.07)",
    maxWidth: "760px",
    marginTop: "2rem",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.1rem",
  },
  title: { color: "#7b2cbf", margin: 0 },
  label: { display: "block", fontSize: "13px", marginBottom: "0.35rem" },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #f2d9ff",
    outline: "none",
    background: "#fff",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #e7c6ff",
    minHeight: "90px",
    outline: "none",
    background: "#fff",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.25rem",
    marginBottom: "1.25rem",
  },
  symptomWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.65rem",
    marginBottom: "1.25rem",
    padding: "0.9rem",
    borderRadius: "14px",
    background: "#fff0f8",
    border: "1px solid #f6d7ea",
  },
  symptomChip: {
    border: "1px solid #f1d5ff",
    background: "#ffffff",
    padding: "8px 12px",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "13px",
    color: "#5a189a",
    transition: "0.2s",
  },
  symptomChipActive: {
    background: "linear-gradient(135deg, #ffb3d9, #e0aaff)",
    border: "1px solid rgba(181, 23, 158, 0.25)",
    color: "#3c096c",
  },
  range: {
    width: "100%",
    height: "8px",
    borderRadius: "999px",
    appearance: "none",
    outline: "none",
  },
  rangeValue: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginTop: "0.4rem",
    fontSize: "13px",
    color: "#333",
  },
  painDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#ff5d8f",
    display: "inline-block",
  },
  button: {
    width: "100%",
    marginTop: "1rem",
    padding: "12px",
    background: "linear-gradient(135deg, #ff85c0, #b5179e)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },
  error: { color: "#d00000", fontSize: "14px", marginBottom: "0.6rem" },
  success: { color: "#2d6a4f", fontSize: "14px", marginBottom: "0.6rem" },
  softNote: { marginTop: "1rem", fontSize: "13px", color: "#6c757d" },
};

export default DailyLogForm;
