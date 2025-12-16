import CycleTrackingForm from "../components/CycleTrackingForm";
import { apiGet } from "../services/api";
import InsightsPanel from "../components/InsightsPanel";
import DailyLogForm from "../components/DailyLogForm";
import girlImg from "../assets/girl1.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HealthTipsPanel from "../components/HealthTipsPanel";
import RecentActivityPanel from "../components/RecentActivityPanel";



function MainAppPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");


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

        <nav style={styles.nav}>
          <button
            onClick={() => setActiveTab("dashboard")}
            style={{ ...styles.navBtn, ...(activeTab === "dashboard" ? styles.navBtnActive : {}) }}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab("cycle")}
            style={{ ...styles.navBtn, ...(activeTab === "cycle" ? styles.navBtnActive : {}) }}
          >
            Cycle Tracking
          </button>

          <button
            onClick={() => setActiveTab("daily")}
            style={{ ...styles.navBtn, ...(activeTab === "daily" ? styles.navBtnActive : {}) }}
          >
            Daily Log
          </button>

          <button
            onClick={() => setActiveTab("insights")}
            style={{ ...styles.navBtn, ...(activeTab === "insights" ? styles.navBtnActive : {}) }}
          >
            Insights
          </button>

          <button
            onClick={() => setActiveTab("tips")}
            style={{ ...styles.navBtn, ...(activeTab === "tips" ? styles.navBtnActive : {}) }}
          >
            Health Tips
          </button>
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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div>
            <h1>Welcome to Your Cycle Dashboard 🌸</h1>
            <p>Track your cycle, understand your body, and take care of your health.</p>
          </div>

          <img
            src={girlImg}
            alt="HerCycle character"
            style={{
              width: "clamp(150px, 18vw, 260px)",
              height: "auto",
              marginLeft: "auto",
              filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.12))",
            }}
          />

        </div>
        {activeTab === "dashboard" && (
          <>
            {/* Your current welcome + image + cards */}
          </>
        )}

        {activeTab === "cycle" && (
          <>
            <h2 style={styles.sectionTitle}>Cycle Tracking</h2>
            <CycleTrackingForm />
          </>
        )}

        {activeTab === "daily" && (
          <>
            <h2 style={styles.sectionTitle}>Daily Log</h2>
            <DailyLogForm />
          </>
        )}

        {activeTab === "insights" && (
          <>
            <h2 style={styles.sectionTitle}>Insights</h2>
            <InsightsPanel />
          </>
        )}

        {activeTab === "tips" && (
          <>
            <HealthTipsPanel />
          </>
        )}




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
         <DailyLogForm />
        <InsightsPanel />
        <RecentActivityPanel />
        <div style={{ marginTop: "2rem" }}>
          <HealthTipsPanel />
        </div>




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
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  navBtn: {
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.22)",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: "12px",
    cursor: "pointer",
    textAlign: "left",
    fontWeight: "600",
  },

  navBtnActive: {
    background: "rgba(255,255,255,0.28)",
    border: "1px solid rgba(255,255,255,0.45)",
  },

  sectionTitle: {
    color: "#7b2cbf",
    marginTop: 0,
  },

  muted: {
    color: "#6c757d",
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
