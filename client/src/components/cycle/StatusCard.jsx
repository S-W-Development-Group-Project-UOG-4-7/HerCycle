import { upsertCycleProfile, addCycleTracker } from "../../services/cycleApi";



function StatusCard({ title = "Loading…", subtitle = "", variant = "loading" }) {
  const isLoading = variant === "loading";

  return (
    <div style={styles.card}>
      <div style={styles.row}>
        {isLoading && <span style={styles.spinner} />}
        <div>
          <h3 style={styles.title}>{title}</h3>
          {subtitle ? <p style={styles.subtitle}>{subtitle}</p> : null}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    marginTop: "1rem",
    background: "linear-gradient(180deg, #ffffff, #fff6fb)",
    border: "1px solid #f1d5ff",
    borderRadius: "16px",
    padding: "1.25rem",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    maxWidth: "900px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  title: {
    margin: 0,
    color: "#7b2cbf",
    fontSize: "18px",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6c757d",
    fontSize: "14px",
  },
  spinner: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    border: "3px solid rgba(157, 78, 221, 0.25)",
    borderTop: "3px solid rgba(181, 23, 158, 0.9)",
    animation: "spin 0.9s linear infinite",
  },
};

export default StatusCard;
