import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./WebManagerProfile.css";

const WebManagerProfile = () => {
  const navigate = useNavigate();

  const defaultUser = useMemo(
    () => ({
      full_name: "Shenupa Betheni",
      role: "web_manager",
      email: "bethenipieris2003@gmail.com",
      contact_number: "",
      gender: "",
      date_of_birth: "",
      avatar_url: "",
      join_date: "2024-03-15",
      last_login: new Date().toISOString().split("T")[0],
      department: "Web Management",
      location: "Colombo, Sri Lanka"
    }),
    []
  );

  const [user, setUser] = useState(null);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    gender: "",
    date_of_birth: "",
    avatar_url: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("profile");

  const token = useMemo(() => localStorage.getItem("authToken"), []);
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const u = storedUser || defaultUser;
    if (u?.role && u.role !== "web_manager") {
      navigate("/login");
      return;
    }

    setUser(u);
    setProfileForm({
      full_name: u?.full_name || defaultUser.full_name,
      email: u?.email || defaultUser.email,
      contact_number: u?.contact_number || "",
      gender: u?.gender || "",
      date_of_birth: (u?.date_of_birth || "").split("T")[0] || "",
      avatar_url: u?.avatar_url || ""
    });

    setLoading(false);
  }, [navigate, token, storedUser, defaultUser]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!profileForm.full_name.trim()) {
      setMessage({ type: "error", text: "Full name is required." });
      return;
    }

    try {
      setSavingProfile(true);
      const payload = {
        ...profileForm,
        date_of_birth: profileForm.date_of_birth || null
      };

      const res = await fetch("http://localhost:5000/api/user/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let msg = "Failed to update profile.";
        try {
          const data = await res.json();
          msg = data?.message || msg;
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(msg);
      }

      const updated = { ...(user || defaultUser), ...payload };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));

      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Profile update failed." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setMessage({ type: "error", text: "Please fill all password fields." });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage({ type: "error", text: "New password and confirm password do not match." });
      return;
    }

    try {
      setSavingPassword(true);
      const res = await fetch("http://localhost:5000/api/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (!res.ok) {
        let msg = "Failed to change password.";
        try {
          const data = await res.json();
          msg = data?.message || msg;
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(msg);
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      });

      setMessage({ type: "success", text: "Password changed successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Password change failed." });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="wm-pro-loading">
        <div className="wm-pro-spinner"></div>
        <p>Loading Profile...</p>
      </div>
    );
  }

  const displayName = user?.full_name || defaultUser.full_name;
  const displayEmail = user?.email || defaultUser.email;

  return (
    <div className="wm-pro-container">
      {/* Top Navigation */}
      <nav className="wm-pro-nav">
        <div className="wm-pro-nav-content">
          <div className="wm-pro-nav-brand">
            <span className="wm-pro-logo">HM</span>
            <span>HerCycle Manager</span>
          </div>
          
          <div className="wm-pro-nav-actions">
            <Link to="/web-manager-dashboard" className="wm-pro-nav-link">
              <span className="wm-pro-icon">←</span> Back to Dashboard
            </Link>
            <div className="wm-pro-user-menu">
              <span className="wm-pro-user-greeting">Hello, {displayName.split(' ')[0]}</span>
              <button className="wm-pro-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="wm-pro-main">
        {/* Left Sidebar */}
        <aside className="wm-pro-sidebar">
          <div className="wm-pro-user-card">
            <div className="wm-pro-avatar">
              {profileForm.avatar_url ? (
                <img src={profileForm.avatar_url} alt="Avatar" />
              ) : (
                <div className="wm-pro-avatar-fallback">
                  {displayName?.trim()?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="wm-pro-user-info">
              <h2>{displayName}</h2>
              <p className="wm-pro-user-role">Web Manager</p>
              <p className="wm-pro-user-email">{displayEmail}</p>
            </div>
            
            <div className="wm-pro-user-stats">
              <div className="wm-pro-stat">
                <span className="wm-pro-stat-label">Joined</span>
                <span className="wm-pro-stat-value">{defaultUser.join_date}</span>
              </div>
              <div className="wm-pro-stat">
                <span className="wm-pro-stat-label">Status</span>
                <span className="wm-pro-status-active">Active</span>
              </div>
            </div>
          </div>

          <nav className="wm-pro-sidebar-nav">
            <button 
              className={`wm-pro-sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="wm-pro-link-icon">👤</span>
              Personal Information
            </button>
            <button 
              className={`wm-pro-sidebar-link ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className="wm-pro-link-icon">🔒</span>
              Security
            </button>
            <button 
              className={`wm-pro-sidebar-link ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <span className="wm-pro-link-icon">⚙️</span>
              Preferences
            </button>
            <button 
              className={`wm-pro-sidebar-link ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <span className="wm-pro-link-icon">📊</span>
              Activity Log
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="wm-pro-content">
          {/* Message Alert */}
          {message.text && (
            <div className={`wm-pro-alert wm-pro-alert-${message.type}`}>
              <span>{message.text}</span>
              <button onClick={() => setMessage({ type: "", text: "" })}>×</button>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="wm-pro-card">
              <div className="wm-pro-card-header">
                <h1>Personal Information</h1>
                <p>Update your personal details and contact information</p>
              </div>
              
              <form onSubmit={handleProfileSubmit} className="wm-pro-form">
                <div className="wm-pro-form-section">
                  <h3>Basic Information</h3>
                  <div className="wm-pro-form-row">
                    <div className="wm-pro-form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        placeholder="Enter your full name"
                        className="wm-pro-input"
                      />
                    </div>
                    
                    <div className="wm-pro-form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        disabled
                        className="wm-pro-input wm-pro-input-disabled"
                      />
                      <span className="wm-pro-input-note">Contact administrator to change email</span>
                    </div>
                  </div>
                </div>

                <div className="wm-pro-form-section">
                  <h3>Contact Details</h3>
                  <div className="wm-pro-form-row">
                    <div className="wm-pro-form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={profileForm.contact_number}
                        onChange={(e) => setProfileForm({ ...profileForm, contact_number: e.target.value })}
                        placeholder="+94 7X XXX XXXX"
                        className="wm-pro-input"
                      />
                    </div>
                    
                    <div className="wm-pro-form-group">
                      <label>Gender</label>
                      <select
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                        className="wm-pro-input"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="wm-pro-form-section">
                  <h3>Additional Information</h3>
                  <div className="wm-pro-form-row">
                    <div className="wm-pro-form-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        value={profileForm.date_of_birth || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                        className="wm-pro-input"
                      />
                    </div>
                    
                    <div className="wm-pro-form-group">
                      <label>Profile Picture URL</label>
                      <input
                        type="text"
                        value={profileForm.avatar_url}
                        onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                        placeholder="https://example.com/profile.jpg"
                        className="wm-pro-input"
                      />
                      <span className="wm-pro-input-note">Optional - enter a URL for your profile picture</span>
                    </div>
                  </div>
                </div>

                <div className="wm-pro-form-actions">
                  <button type="submit" className="wm-pro-btn-primary" disabled={savingProfile}>
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" className="wm-pro-btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="wm-pro-card">
              <div className="wm-pro-card-header">
                <h1>Security Settings</h1>
                <p>Manage your password and account security</p>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="wm-pro-form">
                <div className="wm-pro-form-section">
                  <h3>Change Password</h3>
                  <div className="wm-pro-form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="wm-pro-input"
                    />
                  </div>
                  
                  <div className="wm-pro-form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="wm-pro-input"
                    />
                    <span className="wm-pro-input-note">Minimum 8 characters with letters and numbers</span>
                  </div>
                  
                  <div className="wm-pro-form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmNewPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="wm-pro-input"
                    />
                  </div>
                </div>

                <div className="wm-pro-security-note">
                  <div className="wm-pro-note-icon">💡</div>
                  <div>
                    <h4>Security Recommendations</h4>
                    <p>• Use a unique password for this account</p>
                    <p>• Avoid using personal information in passwords</p>
                    <p>• Change your password regularly</p>
                  </div>
                </div>

                <div className="wm-pro-form-actions">
                  <button type="submit" className="wm-pro-btn-primary" disabled={savingPassword}>
                    {savingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="wm-pro-card">
              <div className="wm-pro-card-header">
                <h1>Preferences</h1>
                <p>Customize your account settings</p>
              </div>
              
              <div className="wm-pro-preferences">
                <div className="wm-pro-preference-section">
                  <h3>Notification Settings</h3>
                  
                  <div className="wm-pro-preference-item">
                    <div>
                      <h4>Email Notifications</h4>
                      <p>Receive email updates about account activity</p>
                    </div>
                    <label className="wm-pro-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="wm-pro-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div className="wm-pro-preference-item">
                    <div>
                      <h4>System Updates</h4>
                      <p>Get notified about system maintenance</p>
                    </div>
                    <label className="wm-pro-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="wm-pro-switch-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="wm-pro-preference-section">
                  <h3>Display Settings</h3>
                  
                  <div className="wm-pro-form-group">
                    <label>Theme</label>
                    <select className="wm-pro-input">
                      <option>Light Theme</option>
                      <option>Dark Theme</option>
                      <option>System Default</option>
                    </select>
                  </div>
                  
                  <div className="wm-pro-form-group">
                    <label>Language</label>
                    <select className="wm-pro-input">
                      <option>English</option>
                      <option>Sinhala</option>
                      <option>Tamil</option>
                    </select>
                  </div>
                </div>

                <div className="wm-pro-form-actions">
                  <button type="button" className="wm-pro-btn-primary">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="wm-pro-card">
              <div className="wm-pro-card-header">
                <h1>Activity Log</h1>
                <p>Recent account activity and access history</p>
              </div>
              
              <div className="wm-pro-activity-list">
                <div className="wm-pro-activity-item">
                  <div className="wm-pro-activity-icon">👤</div>
                  <div className="wm-pro-activity-content">
                    <h4>Profile Updated</h4>
                    <p>Personal information was modified</p>
                    <span className="wm-pro-activity-time">2 hours ago</span>
                  </div>
                </div>
                
                <div className="wm-pro-activity-item">
                  <div className="wm-pro-activity-icon">🔐</div>
                  <div className="wm-pro-activity-content">
                    <h4>Successful Login</h4>
                    <p>Logged in from Chrome on Windows</p>
                    <span className="wm-pro-activity-time">Yesterday, 10:30 AM</span>
                  </div>
                </div>
                
                <div className="wm-pro-activity-item">
                  <div className="wm-pro-activity-icon">📧</div>
                  <div className="wm-pro-activity-content">
                    <h4>Email Verification</h4>
                    <p>Email address was confirmed</p>
                    <span className="wm-pro-activity-time">March 15, 2024</span>
                  </div>
                </div>
                
                <div className="wm-pro-activity-item">
                  <div className="wm-pro-activity-icon">✅</div>
                  <div className="wm-pro-activity-content">
                    <h4>Account Created</h4>
                    <p>Web Manager account was activated</p>
                    <span className="wm-pro-activity-time">March 15, 2024</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="wm-pro-footer">
        <p>© 2024 HerCycle Web Manager. Version 2.1.0</p>
        <div className="wm-pro-footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default WebManagerProfile;