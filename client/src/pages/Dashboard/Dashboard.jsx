import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

import DailyLogForm from "../../components/cycle/DailyLogForm";
import HistoryPanel from "../../components/cycle/HistoryPanel";
import InsightsPanel from "../../components/cycle/InsightsPanel";

// Isuri
import ProfilePanel from "../../components/cycle/ProfilePanel";
import CycleTrackingForm from "../../components/cycle/CycleTrackingForm";
import {
  getCycleProfile,
  getCycleHistory,
  saveDailyLog,
  deleteDailyLog,
  deleteCycleTracker
} from "../../services/cycleApi";


const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cycleProfile, setCycleProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from localStorage or API
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      navigate("/login");
      return;
    }

    setUser(userData);

    // Check if user has cycle tracking enabled
    if (userData.is_cycle_user) {
      fetchCycleProfile(userData.NIC);
    }

    setLoading(false);
  }, [navigate]);

  const fetchCycleProfile = async (nic) => {
    try {
      const profile = await getCycleProfile(nic);
      setCycleProfile(profile);
    } catch (error) {
      console.error("Error fetching cycle profile:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>HerCycle</h2>
          <div className="user-greeting">
            <span className="welcome-text">Welcome back,</span>
            <span className="user-name">{user?.full_name}</span>
            <span className="user-role">Community Member</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Overview</span>
          </button>

          <button
            className={`nav-item ${activeTab === "community" ? "active" : ""}`}
            onClick={() => setActiveTab("community")}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Community</span>
          </button>

          {user?.is_cycle_user && (
            <>
              <button
                className={`nav-item ${activeTab === "cycle-tracking" ? "active" : ""}`}
                onClick={() => setActiveTab("cycle-tracking")}
              >
                <span className="nav-icon">📅</span>
                <span className="nav-text">Cycle Tracking</span>
              </button>

              <button
                className={`nav-item ${activeTab === "health-insights" ? "active" : ""}`}
                onClick={() => setActiveTab("health-insights")}
              >
                <span className="nav-icon">💡</span>
                <span className="nav-text">Health Insights</span>
              </button>
            </>
          )}

          <button
            className={`nav-item ${activeTab === "fundraising" ? "active" : ""}`}
            onClick={() => setActiveTab("fundraising")}
          >
            <span className="nav-icon">💰</span>
            <span className="nav-text">Fundraising</span>
          </button>

          <button
            className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-text">My Profile</span>
          </button>

          <button
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            {activeTab === "overview" && "Dashboard Overview"}
            {activeTab === "community" && "Community"}
            {activeTab === "cycle-tracking" && "Cycle Tracking"}
            {activeTab === "health-insights" && "Health Insights"}
            {activeTab === "fundraising" && "Fundraising"}
            {activeTab === "profile" && "My Profile"}
            {activeTab === "settings" && "Settings"}
          </h1>

          <div className="header-actions">
            <button className="notification-btn">
              <span className="notification-icon">🔔</span>
              <span className="notification-count">3</span>
            </button>
            <div className="user-avatar">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt={user.full_name} />
              ) : (
                <div className="avatar-placeholder">{user?.full_name?.charAt(0) || "U"}</div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="overview-container">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📝</div>
                  <div className="stat-content">
                    <h3>Posts Created</h3>
                    <p className="stat-value">12</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💬</div>
                  <div className="stat-content">
                    <h3>Comments</h3>
                    <p className="stat-value">45</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">❤️</div>
                  <div className="stat-content">
                    <h3>Likes Received</h3>
                    <p className="stat-value">128</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <h3>Donations</h3>
                    <p className="stat-value">$250</p>
                  </div>
                </div>
              </div>

              {/* Cycle Tracking Widget (if enabled) */}
              {user?.is_cycle_user && cycleProfile && (
                <div className="cycle-widget">
                  <h2>Cycle Tracking</h2>
                  <div className="cycle-status">
                    <div className="cycle-phase">
                      <span className="phase-label">Current Phase:</span>
                      <span className="phase-value">Follicular</span>
                    </div>
                    <div className="cycle-days">
                      <span className="days-label">Cycle Day:</span>
                      <span className="days-value">14</span>
                    </div>
                    <div className="next-period">
                      <span className="next-label">Next Period:</span>
                      <span className="next-value">In 14 days</span>
                    </div>
                  </div>
                  <button className="log-day-btn" onClick={() => setActiveTab("cycle-tracking")}>
                    Log Today's Entry
                  </button>
                </div>
              )}

              {/* Recent Activity */}
              <div className="recent-activity">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon">📝</div>
                    <div className="activity-content">
                      <p>You created a post "Managing PCOS Symptoms"</p>
                      <span className="activity-time">2 hours ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">💬</div>
                    <div className="activity-content">
                      <p>You commented on "Period Pain Remedies"</p>
                      <span className="activity-time">Yesterday</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cycle Tracking Tab (only visible if enabled) */}
          {activeTab === "cycle-tracking" && user?.is_cycle_user && (
            <CycleTrackingTab user={user} cycleProfile={cycleProfile} />
          )}

          {/* Community Tab */}
          {activeTab === "community" && <CommunityTab />}

          {/* Health Insights Tab (only visible if cycle tracking enabled) */}
          {activeTab === "health-insights" && user?.is_cycle_user && <HealthInsightsTab />}

          {/* Fundraising Tab */}
          {activeTab === "fundraising" && <FundraisingTab />}

          {/* Profile Tab */}
          {activeTab === "profile" && <ProfileTab user={user} />}

          {/* Settings Tab */}
          {activeTab === "settings" && <SettingsTab user={user} />}
        </div>
      </div>
    </div>
  );
};

// Sub-components for different tabs
const CycleTrackingTab = ({ user, cycleProfile }) => {
  const [dailyLogs, setDailyLogs] = useState([]);
  const [cycleTrackers, setCycleTrackers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.NIC) return;
    (async () => {
      try {
        const history = await getCycleHistory(user.NIC);
        setDailyLogs(history?.daily_logs || []);
        setCycleTrackers(history?.cycle_trackers || []);
      } catch (e) {
        console.error("Error fetching cycle history:", e);
      }
    })();
  }, [user?.NIC]);

  const refreshHistory = async () => {
    const history = await getCycleHistory(user.NIC);
    setDailyLogs(history?.daily_logs || []);
    setCycleTrackers(history?.cycle_trackers || []);
  };

  const handleSaveDailyLog = async (formData) => {
    try {
      setSaving(true);
      await saveDailyLog({ NIC: user.NIC, ...formData });
      await refreshHistory();
    } catch (e) {
      console.error("Error saving log:", e);
      alert(e.message || "Failed to save daily log");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDailyLog = async (logId) => {
    await deleteDailyLog(logId);
    await refreshHistory();
  };

  const handleDeleteCycleTracker = async (trackerId) => {
    await deleteCycleTracker(trackerId);
    await refreshHistory();
  };

  return (
    <div className="cycle-tracking-tab">
      <h2>Track Your Cycle</h2>

      <div className="cycle-overview">
        <div className="cycle-stats">
          <div className="cycle-stat">
            <span className="stat-label">Cycle Length</span>
            <span className="stat-value">{cycleProfile?.cycle_length || 28} days</span>
          </div>
          <div className="cycle-stat">
            <span className="stat-label">Period Length</span>
            <span className="stat-value">{cycleProfile?.period_length || 5} days</span>
          </div>
          <div className="cycle-stat">
            <span className="stat-label">Last Period</span>
            <span className="stat-value">
              {cycleProfile?.last_period_start
                ? new Date(cycleProfile.last_period_start).toLocaleDateString()
                : "Not recorded"}
            </span>
          </div>
        </div>
      </div>

      <CycleTrackingForm
        nic={user?.NIC}
        onSaved={async () => {
          try {
            await refreshHistory();
          } catch (e) {
            console.error("Error refreshing history:", e);
          }
        }}
      />

      <DailyLogForm
        initialDate={new Date().toISOString().split("T")[0]}
        onSave={handleSaveDailyLog}
        saving={saving}
      />

      <HistoryPanel
        dailyLogs={dailyLogs}
        cycleTrackers={cycleTrackers}
        usePopupMessages={true}
        onDeleteDailyLog={handleDeleteDailyLog}
        onDeleteCycleTracker={handleDeleteCycleTracker}
      />

      <InsightsPanel cycleProfile={cycleProfile} dailyLogs={dailyLogs} />
    </div>
  );
};

const CommunityTab = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  return (
    <div className="community-tab">
      <div className="create-post">
        <textarea
          placeholder="Share your thoughts, ask questions, or provide support..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          rows="3"
        />
        <div className="post-actions">
          <button className="post-btn">Create Post</button>
          <div className="post-options">
            <button className="option-btn">📷</button>
            <button className="option-btn">🎥</button>
            <button className="option-btn">📄</button>
          </div>
        </div>
      </div>

      <div className="posts-feed">
        <h3>Recent Community Posts</h3>
        <div className="post">
          <div className="post-header">
            <div className="post-author">
              <div className="author-avatar">A</div>
              <div className="author-info">
                <span className="author-name">Anna Maria</span>
                <span className="post-time">2 hours ago</span>
              </div>
            </div>
          </div>
          <div className="post-content">
            <p>
              Just wanted to share that switching to a plant-based diet has significantly reduced my
              period pain! Has anyone else tried dietary changes?
            </p>
          </div>
          <div className="post-actions">
            <button className="like-btn">❤️ 24</button>
            <button className="comment-btn">💬 8</button>
            <button className="share-btn">↪️ Share</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HealthInsightsTab = () => {
  return (
    <div className="health-insights-tab">
      <h2>Health Insights</h2>

      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-icon">📊</div>
          <h3>Cycle Patterns</h3>
          <p>Your cycles have been regular for the past 3 months</p>
        </div>

        <div className="insight-card">
          <div className="insight-icon">💡</div>
          <h3>Symptom Trends</h3>
          <p>Headaches tend to occur 2 days before your period starts</p>
        </div>

        <div className="insight-card">
          <div className="insight-icon">🎯</div>
          <h3>Predictions</h3>
          <p>Next ovulation predicted in 5 days</p>
        </div>

        <div className="insight-card">
          <div className="insight-icon">💭</div>
          <h3>Mood Analysis</h3>
          <p>You're most energetic during your follicular phase</p>
        </div>
      </div>

      <div className="charts-section">
        <h3>Cycle History</h3>
        <div className="chart-placeholder">
          <p>Graph showing cycle length variations over time</p>
        </div>
      </div>
    </div>
  );
};

const FundraisingTab = () => {
  const [campaigns, setCampaigns] = useState([]);

  return (
    <div className="fundraising-tab">
      <h2>Support Causes You Care About</h2>

      <div className="campaigns-grid">
        <div className="campaign-card">
          <div className="campaign-image">
            <img src="https://via.placeholder.com/300x150" alt="Campaign" />
          </div>
          <div className="campaign-content">
            <h3>Menstrual Hygiene in Rural Areas</h3>
            <p>Providing sanitary products to 1000 girls in rural communities</p>
            <div className="campaign-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "65%" }}></div>
              </div>
              <div className="progress-stats">
                <span>$6,500 raised</span>
                <span>$10,000 goal</span>
              </div>
            </div>
            <button className="donate-btn">Donate Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};


const ProfileTab = ({ user }) => {
  const [subTab, setSubTab] = useState("account"); // "account" | "cycle"

  return (
    <div className="profile-tab">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt={user.full_name} />
          ) : (
            <div className="avatar-large-placeholder">{user?.full_name?.charAt(0) || "U"}</div>
          )}
        </div>

        <div className="profile-info">
          <h2>{user?.full_name}</h2>
          <p className="profile-email">{user?.email}</p>
          <p className="profile-role">Community Member</p>
          {user?.is_cycle_user && <span className="cycle-badge">🔴 Cycle Tracking Active</span>}
        </div>
      </div>

      {/* Sub tabs (simple, no router needed) */}
      <div style={{ display: "flex", gap: 10, marginTop: 20, marginBottom: 20 }}>
        <button
          className={`nav-item ${subTab === "account" ? "active" : ""}`}
          onClick={() => setSubTab("account")}
        >
          Account
        </button>

        {user?.is_cycle_user && (
          <button
            className={`nav-item ${subTab === "cycle" ? "active" : ""}`}
            onClick={() => setSubTab("cycle")}
          >
            Cycle Profile
          </button>
        )}
      </div>

      {/* Account Info (your original UI) */}
      {subTab === "account" && (
        <>
          <div className="profile-details">
            <h3>Personal Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">NIC</span>
                <span className="detail-value">{user?.NIC}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Gender</span>
                <span className="detail-value">{user?.gender}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date of Birth</span>
                <span className="detail-value">
                  {user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Contact</span>
                <span className="detail-value">{user?.contact_number || "Not provided"}</span>
              </div>
            </div>
          </div>

          <div className="profile-stats">
            <h3>Community Activity</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">12</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">45</span>
                <span className="stat-label">Comments</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">128</span>
                <span className="stat-label">Likes Received</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">3</span>
                <span className="stat-label">Campaigns Supported</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Cycle Profile (your module) */}
      {subTab === "cycle" && user?.is_cycle_user && <ProfilePanel user={user} />}
    </div>
  );
};

const SettingsTab = ({ user }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newsletter: true,
    privacy: "friends",
  });

  return (
    <div className="settings-tab">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>Notification Preferences</h3>
        <div className="setting-item">
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
            />
            <span className="slider"></span>
          </label>
          <div className="setting-info">
            <span className="setting-label">Email Notifications</span>
            <span className="setting-desc">Receive updates via email</span>
          </div>
        </div>

        <div className="setting-item">
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
            />
            <span className="slider"></span>
          </label>
          <div className="setting-info">
            <span className="setting-label">Push Notifications</span>
            <span className="setting-desc">Get browser notifications</span>
          </div>
        </div>
      </div>

      {user?.is_cycle_user && (
        <div className="settings-section">
          <h3>Cycle Tracking Settings</h3>
          <div className="setting-item">
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
            <div className="setting-info">
              <span className="setting-label">Period Reminders</span>
              <span className="setting-desc">Get notified about upcoming periods</span>
            </div>
          </div>

          <div className="setting-item">
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
            <div className="setting-info">
              <span className="setting-label">Symptom Tracking</span>
              <span className="setting-desc">Track symptoms and mood</span>
            </div>
          </div>
        </div>
      )}

      <div className="settings-section">
        <h3>Privacy Settings</h3>
        <div className="privacy-options">
          <label className="privacy-option">
            <input
              type="radio"
              name="privacy"
              value="public"
              checked={settings.privacy === "public"}
              onChange={(e) => setSettings({ ...settings, privacy: e.target.value })}
            />
            <span>Public</span>
          </label>
          <label className="privacy-option">
            <input
              type="radio"
              name="privacy"
              value="friends"
              checked={settings.privacy === "friends"}
              onChange={(e) => setSettings({ ...settings, privacy: e.target.value })}
            />
            <span>Friends Only</span>
          </label>
          <label className="privacy-option">
            <input
              type="radio"
              name="privacy"
              value="private"
              checked={settings.privacy === "private"}
              onChange={(e) => setSettings({ ...settings, privacy: e.target.value })}
            />
            <span>Private</span>
          </label>
        </div>
      </div>

      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <button className="danger-btn">Deactivate Account</button>
      </div>
    </div>
  );
};

export default Dashboard;
