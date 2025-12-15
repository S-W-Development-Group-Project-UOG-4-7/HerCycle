import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CycleTrackingForm from "../components/CycleTrackingForm";
import { apiGet } from "../services/api";
import InsightsPanel from "../components/InsightsPanel";



function MainAppPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet("/api/dashboard/summary");
        setSummary(data);
      } catch (e) {
        // optional: show error somewhere
      }
    };
    load();
  }, [navigate]);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>HerCycle</h2>

        <nav>
          <p style={styles.navItem}>Dashboard</p>
          <p style={styles.navItem}>Cycle Tracking</p>
          <p style={styles.navItem}>Insights</p>
          <p style={styles.navItem}>Health Tips</p>
        </nav>

        <button
          style={styles.logout}
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </button>
      </aside>

      <main style={styles.main}>
        <h1>Welcome to Your Cycle Dashboard 🌸</h1>
        <p>
          Track your cycle, understand your body, and take care of your health.
        </p>

        <div style={styles.cards}>
          <div style={styles.card}>
            Next Period:{" "}
            {summary?.hasData ? new Date(summary.nextPeriodDate).toLocaleDateString() : "--"}
          </div>

          <div style={styles.card}>
            Cycle Length: {summary?.hasData ? `${summary.avgCycleLength} days` : "--"}
          </div>

          <div style={styles.card}>
            Phase: {summary?.hasData ? summary.currentPhase : "--"}
          </div>
        </div>

        <CycleTrackingForm />
        <InsightsPanel />


      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#fdf6ff",
  },
  sidebar: {
    width: "220px",
    background: "linear-gradient(180deg, #9d4edd, #f15bb5)",
    color: "#fff",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  logo: {
    marginBottom: "2rem",
    textAlign: "center",
  },
  navItem: {
    margin: "1rem 0",
    cursor: "pointer",
    fontWeight: "500",
  },
  logout: {
    background: "#fff",
    color: "#b5179e",
    border: "none",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  main: {
    flex: 1,
    padding: "2rem",
  },
  cards: {
    display: "flex",
    gap: "1rem",
    marginTop: "2rem",
  },
  card: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    minWidth: "180px",
  },
};

export default MainAppPage;
