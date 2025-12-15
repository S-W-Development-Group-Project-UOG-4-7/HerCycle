import { useEffect, useState } from "react";
import { apiGet } from "../services/api";

function InsightsPanel() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet("/api/insights");
        setItems(data.insights || []);
      } catch (e) {
        setError("Could not load insights.");
      }
    };
    load();
  }, []);

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>Insights ✨</h3>
      {error && <p style={styles.error}>{error}</p>}

      {items.map((it, idx) => (
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
  error: { color: "#d00000" },
};

export default InsightsPanel;
