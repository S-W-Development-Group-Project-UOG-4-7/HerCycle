import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./WebmanagerProfile.css";

const WebmanagerProfile = () => {
  const navigate = useNavigate();

  const defaultUser = useMemo(
    () => ({
      full_name: "Shenupa Betheni",
      role: "web_manager",
      email: "bethenipieris2003@gmail.com",
      contact_number: "+94 77 123 4567",
      gender: "female",
      date_of_birth: "2003-05-15",
      avatar_url: "",
      join_date: "2024-03-15",
      last_login: new Date().toISOString().split("T")[0],
      department: "Web Management",
      location: "Colombo, Sri Lanka",
      status: "active"
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
    avatar_url: "",
    location: "",
    department: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    systemUpdates: true,
    theme: "light",
    language: "english"
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("profile");
  const [activityLog, setActivityLog] = useState([]);
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  const token = useMemo(() => localStorage.getItem("authToken"), []);
  const storedUser = useMemo(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      return userData;
    } catch {
      return null;
    }
  }, []);

  // Check if backend is available
  const checkBackendStatus = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setIsBackendOnline(response.ok);
      return response.ok;
    } catch (error) {
      setIsBackendOnline(false);
      return false;
    }
  };

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        await checkBackendStatus();
        
        if (isBackendOnline) {
          // Try to fetch user data from API
          const response = await fetch("http://localhost:5000/api/user/profile", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setProfileForm({
              full_name: userData.full_name || "",
              email: userData.email || "",
              contact_number: userData.contact_number || "",
              gender: userData.gender || "",
              date_of_birth: userData.date_of_birth ? userData.date_of_birth.split("T")[0] : "",
              avatar_url: userData.avatar_url || "",
              location: userData.location || "",
              department: userData.department || ""
            });
            if (userData.avatar_url) {
              setAvatarPreview(userData.avatar_url);
            }
          } else {
            // Fallback to stored or default user
            const u = storedUser || defaultUser;
            if (u?.role && u.role !== "web_manager") {
              navigate("/login");
              return;
            }
            setUser(u);
            setProfileForm({
              full_name: u?.full_name || defaultUser.full_name,
              email: u?.email || defaultUser.email,
              contact_number: u?.contact_number || defaultUser.contact_number,
              gender: u?.gender || defaultUser.gender,
              date_of_birth: u?.date_of_birth ? u.date_of_birth.split("T")[0] : defaultUser.date_of_birth,
              avatar_url: u?.avatar_url || "",
              location: u?.location || defaultUser.location,
              department: u?.department || defaultUser.department
            });
            if (u?.avatar_url) {
              setAvatarPreview(u.avatar_url);
            }
          }
        } else {
          // Backend offline, use stored data
          const u = storedUser || defaultUser;
          if (u?.role && u.role !== "web_manager") {
            navigate("/login");
            return;
          }
          setUser(u);
          setProfileForm({
            full_name: u?.full_name || defaultUser.full_name,
            email: u?.email || defaultUser.email,
            contact_number: u?.contact_number || defaultUser.contact_number,
            gender: u?.gender || defaultUser.gender,
            date_of_birth: u?.date_of_birth ? u.date_of_birth.split("T")[0] : defaultUser.date_of_birth,
            avatar_url: u?.avatar_url || "",
            location: u?.location || defaultUser.location,
            department: u?.department || defaultUser.department
          });
          if (u?.avatar_url) {
            setAvatarPreview(u.avatar_url);
          }
        }

        // Load activity log
        loadActivityLog();
      } catch (error) {
        console.error("Error loading user data:", error);
        // Use stored user as fallback
        const u = storedUser || defaultUser;
        setUser(u);
        setProfileForm({
          full_name: u?.full_name || defaultUser.full_name,
          email: u?.email || defaultUser.email,
          contact_number: u?.contact_number || defaultUser.contact_number,
          gender: u?.gender || defaultUser.gender,
          date_of_birth: u?.date_of_birth ? u.date_of_birth.split("T")[0] : defaultUser.date_of_birth,
          avatar_url: u?.avatar_url || "",
          location: u?.location || defaultUser.location,
          department: u?.department || defaultUser.department
        });
        if (u?.avatar_url) {
          setAvatarPreview(u.avatar_url);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate, token, storedUser, defaultUser, isBackendOnline]);

  const loadActivityLog = async () => {
    try {
      const activities = [
        {
          id: 1,
          type: "profile_update",
          title: "Profile Updated",
          description: "Personal information was modified",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          type: "login",
          title: "Successful Login",
          description: "Logged in from Chrome on Windows",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          type: "email_verification",
          title: "Email Verified",
          description: "Email address was confirmed",
          timestamp: "2024-03-15T10:30:00Z"
        },
        {
          id: 4,
          type: "account_creation",
          title: "Account Created",
          description: "Web Manager account was activated",
          timestamp: "2024-03-15T08:00:00Z"
        }
      ];
      setActivityLog(activities);
    } catch (error) {
      console.error("Error loading activity log:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clean up previous blob URL if exists
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setProfileForm(prev => ({ ...prev, avatar_url: "" }));
    }
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

      // Update local storage immediately for better UX
      const updatedUser = { ...user, ...profileForm };
      if (avatarFile) {
        // Simulate avatar upload by using blob URL temporarily
        updatedUser.avatar_url = avatarPreview;
      }
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      // If backend is offline, show success message without API call
      if (!isBackendOnline) {
        setMessage({ type: "success", text: "Profile saved locally (backend offline)" });
        setAvatarFile(null);
        return;
      }

      // Prepare payload for API
      const payload = {
        full_name: profileForm.full_name,
        contact_number: profileForm.contact_number,
        gender: profileForm.gender,
        date_of_birth: profileForm.date_of_birth || null,
        avatar_url: profileForm.avatar_url,
        location: profileForm.location,
        department: profileForm.department
      };

      try {
        const res = await fetch("http://localhost:5000/api/user/profile/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const updated = await res.json();
          setUser(updated);
          localStorage.setItem("user", JSON.stringify(updated));
          setMessage({ type: "success", text: "Profile updated successfully!" });
        } else {
          // If API fails but we already updated locally, show warning
          setMessage({ 
            type: "error", 
            text: "Profile saved locally, but failed to sync with server." 
          });
        }
      } catch (apiError) {
        // API call failed but local update succeeded
        setMessage({ 
          type: "warning", 
          text: "Profile saved locally. Server sync failed." 
        });
      }

      // Add to activity log
      const newActivity = {
        id: activityLog.length + 1,
        type: "profile_update",
        title: "Profile Updated",
        description: "Personal information was modified",
        timestamp: new Date().toISOString()
      };
      setActivityLog([newActivity, ...activityLog.slice(0, 9)]);
      
      // Clear avatar file
      setAvatarFile(null);
    } catch (err) {
      setMessage({ type: "error", text: "Profile update failed. Please try again." });
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

      if (!isBackendOnline) {
        setMessage({ type: "error", text: "Cannot change password while backend is offline." });
        return;
      }

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

      if (res.ok) {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: ""
        });

        // Add to activity log
        const newActivity = {
          id: activityLog.length + 1,
          type: "password_change",
          title: "Password Changed",
          description: "Account password was updated",
          timestamp: new Date().toISOString()
        };
        setActivityLog([newActivity, ...activityLog.slice(0, 9)]);

        setMessage({ type: "success", text: "Password changed successfully!" });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setMessage({ 
          type: "error", 
          text: errorData.message || "Failed to change password. Please check your current password." 
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to connect to server. Please try again." });
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePreferencesSave = async () => {
    try {
      setSavingPreferences(true);
      
      // Save to localStorage for now
      localStorage.setItem("userPreferences", JSON.stringify(preferences));
      
      setMessage({ type: "success", text: "Preferences saved successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save preferences" });
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      if (!isBackendOnline) {
        setMessage({ type: "error", text: "Cannot delete account while backend is offline." });
        return;
      }

      const res = await fetch("http://localhost:5000/api/user/delete-account", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        setMessage({ type: "error", text: "Failed to delete account" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to connect to server" });
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return past.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
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
            <span>HerCycle Web Manager</span>
          </div>
          
          <div className="wm-pro-nav-actions">
            <Link to="/web-manager-dashboard" className="wm-pro-nav-link">
              <span className="wm-pro-icon">←</span> Dashboard
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
            <div className="wm-pro-avatar-container">
              <div className="wm-pro-avatar">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" />
                ) : (
                  <div className="wm-pro-avatar-fallback">
                    {displayName?.trim()?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <label className="wm-pro-avatar-upload" title="Upload profile picture">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
                ✎
              </label>
            </div>
            <div>
              <div className="wm-pro-user-info">
                <h2>{displayName}</h2>
                <p className="wm-pro-user-role">Web Manager</p>
                <div className="wm-pro-user-details">
                  <div className="wm-pro-detail-item">
                    <span className="wm-pro-detail-icon">📧</span>
                    <span>{displayEmail}</span>
                  </div>
                  <div className="wm-pro-detail-item">
                    <span className="wm-pro-detail-icon">📅</span>
                    <span>{profileForm.date_of_birth || defaultUser.date_of_birth}</span>
                  </div>
                  <div className="wm-pro-detail-item">
                    <span className="wm-pro-detail-icon">📱</span>
                    <span>{profileForm.contact_number || defaultUser.contact_number}</span>
                  </div>
                  <div className="wm-pro-detail-item">
                    <span className="wm-pro-detail-icon">📍</span>
                    <span>{profileForm.location || defaultUser.location}</span>
                  </div>
                </div>
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
          {/* Backend Status Indicator */}
          {!isBackendOnline && (
            <div className="wm-pro-alert wm-pro-alert-error" style={{ position: 'relative', top: 0 }}>
              <span>⚠️ Backend is offline. Changes will be saved locally.</span>
              <button onClick={() => {
                setMessage({ type: "", text: "" });
                checkBackendStatus();
              }}>×</button>
            </div>
          )}

          {/* Message Alert */}
          {message.text && (
            <div className={`wm-pro-alert wm-pro-alert-${message.type}`} role="alert">
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
                  <h3>👤 Basic Information</h3>
                  <div className="wm-pro-form-row">
                    <div className="wm-pro-form-group">
                      <label htmlFor="full_name">Full Name *</label>
                      <input
                        id="full_name"
                        type="text"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        placeholder="Enter your full name"
                        className="wm-pro-input"
                        required
                      />
                    </div>
                    
                    <div className="wm-pro-form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        id="email"
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
                  <h3>📞 Contact Details</h3>
                  <div className="wm-pro-form-row">
                    <div className="wm-pro-form-group">
                      <label htmlFor="contact_number">Phone Number</label>
                      <input
                        id="contact_number"
                        type="tel"
                        value={profileForm.contact_number}
                        onChange={(e) => setProfileForm({ ...profileForm, contact_number: e.target.value })}
                        placeholder="+94 7X XXX XXXX"
                        className="wm-pro-input"
                      />
                    </div>
                    
                    <div className="wm-pro-form-group">
                      <label htmlFor="gender">Gender</label>
                      <select
                        id="gender"
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
                  <h3>📍 Additional Information</h3>
                  <div className="wm-pro-form-row">
                    <div className="wm-pro-form-group">
                      <label htmlFor="date_of_birth">Date of Birth</label>
                      <input
                        id="date_of_birth"
                        type="date"
                        value={profileForm.date_of_birth || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                        className="wm-pro-input"
                      />
                    </div>
                    
                    <div className="wm-pro-form-group">
                      <label htmlFor="location">Location</label>
                      <input
                        id="location"
                        type="text"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        placeholder="City, Country"
                        className="wm-pro-input"
                      />
                    </div>
                  </div>
                  
                  <div className="wm-pro-form-group">
                    <label>Profile Picture</label>
                    <div className="wm-pro-file-upload">
                      {avatarPreview && (
                        <div className="wm-pro-file-preview">
                          <img src={avatarPreview} alt="Preview" />
                        </div>
                      )}
                      <div className="wm-pro-file-input">
                        <input
                          type="file"
                          id="avatar_file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                        />
                        <span className="wm-pro-input-note">Upload a profile picture (JPG, PNG, GIF)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="wm-pro-form-group">
                    <label htmlFor="avatar_url">Or enter image URL</label>
                    <input
                      id="avatar_url"
                      type="text"
                      value={profileForm.avatar_url}
                      onChange={(e) => {
                        setProfileForm({ ...profileForm, avatar_url: e.target.value });
                        if (e.target.value.trim()) {
                          setAvatarPreview(e.target.value);
                          setAvatarFile(null);
                        }
                      }}
                      placeholder="https://example.com/profile.jpg"
                      className="wm-pro-input"
                    />
                    <span className="wm-pro-input-note">Enter a URL for your profile picture</span>
                  </div>
                </div>

                <div className="wm-pro-form-actions">
                  <button type="submit" className="wm-pro-btn-primary" disabled={savingProfile}>
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                  <button 
                    type="button" 
                    className="wm-pro-btn-secondary"
                    onClick={() => {
                      setProfileForm({
                        full_name: user?.full_name || defaultUser.full_name,
                        email: user?.email || defaultUser.email,
                        contact_number: user?.contact_number || defaultUser.contact_number,
                        gender: user?.gender || defaultUser.gender,
                        date_of_birth: user?.date_of_birth ? user.date_of_birth.split("T")[0] : defaultUser.date_of_birth,
                        avatar_url: user?.avatar_url || "",
                        location: user?.location || defaultUser.location,
                        department: user?.department || defaultUser.department
                      });
                      if (user?.avatar_url) {
                        setAvatarPreview(user.avatar_url);
                      } else {
                        setAvatarPreview("");
                      }
                      setAvatarFile(null);
                    }}
                  >
                    Reset
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
                  <h3>🔐 Change Password</h3>
                  <div className="wm-pro-form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="wm-pro-input"
                    />
                  </div>
                  
                  <div className="wm-pro-form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="wm-pro-input"
                    />
                    <span className="wm-pro-input-note">Minimum 6 characters</span>
                  </div>
                  
                  <div className="wm-pro-form-group">
                    <label htmlFor="confirmNewPassword">Confirm New Password</label>
                    <input
                      id="confirmNewPassword"
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
                    <p>• Change your password every 90 days</p>
                    <p>• Enable two-factor authentication if available</p>
                  </div>
                </div>

                <div className="wm-pro-form-actions">
                  <button type="submit" className="wm-pro-btn-primary" disabled={savingPassword}>
                    {savingPassword ? "Updating..." : "Update Password"}
                  </button>
                  <button 
                    type="button" 
                    className="wm-pro-btn-danger"
                    onClick={handleDeleteAccount}
                    disabled={!isBackendOnline}
                  >
                    Delete Account
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
                  <h3>🔔 Notification Settings</h3>
                  
                  <div className="wm-pro-preference-item">
                    <div>
                      <h4>Email Notifications</h4>
                      <p>Receive email updates about account activity</p>
                    </div>
                    <label className="wm-pro-switch">
                      <input 
                        type="checkbox" 
                        checked={preferences.emailNotifications}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          emailNotifications: e.target.checked
                        })}
                      />
                      <span className="wm-pro-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div className="wm-pro-preference-item">
                    <div>
                      <h4>System Updates</h4>
                      <p>Get notified about system maintenance</p>
                    </div>
                    <label className="wm-pro-switch">
                      <input 
                        type="checkbox" 
                        checked={preferences.systemUpdates}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          systemUpdates: e.target.checked
                        })}
                      />
                      <span className="wm-pro-switch-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="wm-pro-preference-section">
                  <h3>🎨 Display Settings</h3>
                  
                  <div className="wm-pro-form-group">
                    <label htmlFor="theme">Theme</label>
                    <select 
                      id="theme"
                      className="wm-pro-input"
                      value={preferences.theme}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        theme: e.target.value
                      })}
                    >
                      <option value="light">Light Theme</option>
                      <option value="dark">Dark Theme</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  
                  <div className="wm-pro-form-group">
                    <label htmlFor="language">Language</label>
                    <select 
                      id="language"
                      className="wm-pro-input"
                      value={preferences.language}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        language: e.target.value
                      })}
                    >
                      <option value="english">English</option>
                      <option value="sinhala">Sinhala</option>
                      <option value="tamil">Tamil</option>
                    </select>
                  </div>
                </div>

                <div className="wm-pro-form-actions">
                  <button 
                    type="button" 
                    className="wm-pro-btn-primary"
                    onClick={handlePreferencesSave}
                    disabled={savingPreferences}
                  >
                    {savingPreferences ? "Saving..." : "Save Preferences"}
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
                {activityLog.length > 0 ? (
                  activityLog.map((activity) => (
                    <div key={activity.id} className="wm-pro-activity-item">
                      <div className="wm-pro-activity-icon">
                        {activity.type === 'login' ? '🔐' : 
                         activity.type === 'profile_update' ? '👤' : 
                         activity.type === 'password_change' ? '🔑' :
                         activity.type === 'email_verification' ? '📧' : '✅'}
                      </div>
                      <div className="wm-pro-activity-content">
                        <h4>{activity.title}</h4>
                        <p>{activity.description}</p>
                        <span className="wm-pro-activity-time">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="wm-pro-activity-item">
                    <div className="wm-pro-activity-icon">📊</div>
                    <div className="wm-pro-activity-content">
                      <h4>No Activity Found</h4>
                      <p>Your activity log will appear here</p>
                    </div>
                  </div>
                )}
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
          <a href="#">Help Center</a>
        </div>
      </footer>
    </div>
  );
};

export default WebmanagerProfile;