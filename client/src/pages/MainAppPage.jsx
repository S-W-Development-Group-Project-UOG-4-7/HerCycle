import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiGet } from "../services/api";
import girlImg from "../assets/girl1.png";

import CycleTrackingForm from "../components/CycleTrackingForm";
import DailyLogForm from "../components/DailyLogForm";
import InsightsPanel from "../components/InsightsPanel";
import HealthTipsPanel from "../components/HealthTipsPanel";
import RecentActivityPanel from "../components/RecentActivityPanel";
import PhaseCard from "../components/PhaseCard";
import HistoryPanel from "../components/HistoryPanel";
import StatusCard from "../components/StatusCard";
import ProfilePanel from "../components/ProfilePanel";


function MainAppPage() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("dashboard");

  // ✅ refresh trigger for dashboard + panels after saving cycle/log
  const [refreshTick, setRefreshTick] = useState(0);
  const refreshAll = () => setRefreshTick((t) => t + 1);

  // ✅ auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // ✅ load dashboard summary (re-runs when refreshTick changes)
  useEffect(() => {
    const loadSummary = async () => {
      setSummaryLoading(true);
      try {
        const data = await apiGet("/api/dashboard/summary");
        setSummary(data);
      } catch (e) {
        // optional: handle
        setSummary(null);
      } finally {
        setSummaryLoading(false);
      }
    };

    loadSummary();
  }, [refreshTick]);

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div>
          <h2 style={styles.logo}>HerCycle</h2>

          <nav style={styles.nav}>
            <button
              onClick={() => setActiveTab("profile")}
              style={{ ...styles.navBtn, ...(activeTab === "profile" ? styles.navBtnActive : {}) }}
            >
              Profile
            </button>

            <button
              onClick={() => setActiveTab("dashboard")}
              style={{
                ...styles.navBtn,
                ...(activeTab === "dashboard" ? styles.navBtnActive : {}),
              }}
            >
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab("cycle")}
              style={{
                ...styles.navBtn,
                ...(activeTab === "cycle" ? styles.navBtnActive : {}),
              }}
            >
              Cycle Tracking
            </button>

            <button
              onClick={() => setActiveTab("daily")}
              style={{
                ...styles.navBtn,
                ...(activeTab === "daily" ? styles.navBtnActive : {}),
              }}
            >
              Daily Log
            </button>

            <button
              onClick={() => setActiveTab("insights")}
              style={{
                ...styles.navBtn,
                ...(activeTab === "insights" ? styles.navBtnActive : {}),
              }}
            >
              Insights
            </button>

            <button
              onClick={() => setActiveTab("tips")}
              style={{
                ...styles.navBtn,
                ...(activeTab === "tips" ? styles.navBtnActive : {}),
              }}
            >
              Health Tips
            </button>

            <button
              onClick={() => setActiveTab("history")}
              style={{
                ...styles.navBtn,
                ...(activeTab === "history" ? styles.navBtnActive : {}),
              }}
            >
              History
            </button>
          </nav>
        </div>

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
        {/* header always visible */}
        <div style={styles.headerRow}>
          <div>
            <h1 style={{ margin: 0 }}>Welcome to Your Cycle Dashboard 🌸</h1>
            <p style={{ marginTop: "8px" }}>
              Track your cycle, understand your body, and take care of your health.
            </p>
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

        {activeTab === "profile" && (
          <>
            <ProfilePanel />
          </>
        )}

        {activeTab === "dashboard" && (
          <>
            <h2 style={styles.sectionTitle}>Dashboard</h2>

            {summaryLoading ? (
              <StatusCard
                title="Loading your dashboard…"
                subtitle="Calculating your cycle stats"
                variant="loading"
              />
            ) : (
              <>
                <div style={styles.cards}>
                  <div style={styles.card}>
                    Next Period:{" "}
                    {summary?.hasData
                      ? new Date(summary.nextPeriodDate).toLocaleDateString()
                      : "--"}
                  </div>

                  <div style={styles.card}>
                    Cycle Length: {summary?.hasData ? `${summary.avgCycleLength} days` : "--"}
                  </div>

                  <div style={styles.card}>
                    Phase: {summary?.hasData ? summary.currentPhase : "--"}
                  </div>
                </div>

                {summary && <PhaseCard summary={summary} />}
                {/*refresh panels when a save happens */}
                <RecentActivityPanel key={refreshTick} />
              </>
            )}
          </>
        )}

        {activeTab === "cycle" && (
          <>
            <h2 style={styles.sectionTitle}>Cycle Tracking</h2>
            <CycleTrackingForm onSaved={refreshAll} />
          </>
        )}

        {activeTab === "daily" && (
          <>
            <h2 style={styles.sectionTitle}>Daily Log</h2>
            <DailyLogForm onSaved={refreshAll} />
          </>
        )}

        {activeTab === "insights" && (
          <>
            <h2 style={styles.sectionTitle}>Insights</h2>
            <InsightsPanel key={refreshTick} />
          </>
        )}

        {activeTab === "tips" && (
          <>
            <HealthTipsPanel />
          </>
        )}

        {activeTab === "history" && (
          <>
            <h2 style={styles.sectionTitle}>History</h2>
            <HistoryPanel />
          </>
        )}
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
    marginBottom: "1.5rem",
    textAlign: "center",
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
  logout: {
    background: "#fff",
    color: "#b5179e",
    border: "none",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "800",
  },
  main: {
    flex: 1,
    padding: "2rem",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "1rem",
  },
  sectionTitle: {
    color: "#7b2cbf",
    marginTop: "0.5rem",
  },
  cards: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
    flexWrap: "wrap",
  },
  card: {
    background: "#fff",
    padding: "1.25rem",
    borderRadius: "14px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
    border: "1px solid #f1d5ff",
    minWidth: "180px",
  },
};

export default MainAppPage;
