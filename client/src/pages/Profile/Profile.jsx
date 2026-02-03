import { useState } from "react";
import ProfilePanel from "../../components/cycle/ProfilePanel";
import CycleTrackingForm from "../../components/cycle/CycleTrackingForm";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("account");

  // Get logged-in user (adjust if you use context later)
  const user = JSON.parse(localStorage.getItem("user"));

  const isCycleUser = user?.is_cycle_user === true;

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
        Profile
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <button onClick={() => setActiveTab("account")}>
          Account
        </button>

        <button onClick={() => setActiveTab("security")}>
          Security
        </button>

        {isCycleUser && (
          <button onClick={() => setActiveTab("cycle")}>
            Cycle
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === "account" && (
        <p style={{ color: "#666" }}>
          Account profile section (to be implemented).
        </p>
      )}

      {activeTab === "security" && (
        <p style={{ color: "#666" }}>
          Security settings section (to be implemented).
        </p>
      )}

      {activeTab === "cycle" && isCycleUser && (
        <div style={{ display: "grid", gap: "24px" }}>
          <ProfilePanel />
          <CycleTrackingForm />
        </div>
      )}
    </div>
  );
}
