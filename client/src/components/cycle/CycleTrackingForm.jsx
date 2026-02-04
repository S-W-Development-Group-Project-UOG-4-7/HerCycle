import { useState } from "react";
import { addCycleTracker } from "../../services/cycleApi";

function CycleTrackingForm({ nic, onSaved }) {
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const resetMessages = () => {
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!nic) {
      setError("Missing user information. Please log in again.");
      return;
    }

    if (!periodStart) {
      setError("Period start date is required.");
      return;
    }

    // End date validation
    if (periodEnd && new Date(periodEnd) < new Date(periodStart)) {
      setError("Period end date cannot be earlier than start date.");
      return;
    }

    try {
      setSaving(true);

      await addCycleTracker({
        NIC: nic,
        period_start_date: periodStart,
        period_end_date: periodEnd || null,
        notes: notes || "",
      });

      setMessage("Cycle entry saved successfully 🌸");
      setPeriodStart("");
      setPeriodEnd("");
      setNotes("");

      if (typeof onSaved === "function") {
        await onSaved();
      }
    } catch (err) {
      setError(err?.message || "Failed to save cycle entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.card}>
      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Period Start Date</label>
        <input
          type="date"
          value={periodStart}
          onChange={(e) => {
            setPeriodStart(e.target.value);
            resetMessages();
          }}
          required
          style={styles.input}
        />

        <label style={styles.label}>Period End Date</label>
        <input
          type="date"
          value={periodEnd}
          onChange={(e) => {
            setPeriodEnd(e.target.value);
            resetMessages();
          }}
          style={styles.input}
        />

        <label style={styles.label}>Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            resetMessages();
          }}
          placeholder="Anything you want to note..."
          rows={3}
          style={styles.textarea}
        />

        <button type="submit" style={styles.button} disabled={saving}>
          {saving ? "Saving..." : "Save Cycle"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  card: {
  background: "#fff",
  padding: "1.5rem",
  borderRadius: "14px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",

  width: "100%",          
  maxWidth: "520px",      
  margin: "0 auto",       
  marginTop: "0",         
},

  title: {
    color: "#7b2cbf",
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    marginBottom: "0.3rem",
    fontSize: "14px",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    padding: "8px",
    marginBottom: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    resize: "vertical",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "linear-gradient(135deg, #ff85c0, #b5179e)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
  },
  error: {
    color: "#d00000",
    fontSize: "14px",
    marginBottom: "0.5rem",
    fontWeight: 600,
  },
  success: {
    color: "#2d6a4f",
    fontSize: "14px",
    marginBottom: "0.5rem",
    fontWeight: 600,
  },
};

export default CycleTrackingForm;
