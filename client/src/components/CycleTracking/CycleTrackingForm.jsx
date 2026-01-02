import { useState } from "react";

function CycleTrackingForm() {
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in again.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/cycles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ periodStart, periodEnd }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to save cycle data");
        return;
      }

      setMessage("Cycle data saved successfully 🌸");
      setPeriodStart("");
      setPeriodEnd("");
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Log Your Period</h3>

      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Period Start Date</label>
        <input
          type="date"
          value={periodStart}
          onChange={(e) => setPeriodStart(e.target.value)}
          required
          style={styles.input}
        />

        <label style={styles.label}>Period End Date</label>
        <input
          type="date"
          value={periodEnd}
          onChange={(e) => setPeriodEnd(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Save Cycle
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
    maxWidth: "400px",
    marginTop: "2rem",
  },
  title: {
    color: "#7b2cbf",
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    marginBottom: "0.3rem",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "linear-gradient(135deg, #ff85c0, #b5179e)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  error: {
    color: "#d00000",
    fontSize: "14px",
    marginBottom: "0.5rem",
  },
  success: {
    color: "#2d6a4f",
    fontSize: "14px",
    marginBottom: "0.5rem",
  },
};

export default CycleTrackingForm;
