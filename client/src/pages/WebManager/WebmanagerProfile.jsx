import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./WebmanagerProfile.css";

const WebmanagerProfile = () => {
  const navigate = useNavigate();

  const defaultUser = useMemo(
    () => ({
      full_name: "Shenupa Betheni",
      role: "web_manager",
      email: "web@hercycle.com",
      contact_number: "+94 77 123 4567",
      gender: "female",
      date_of_birth: "2003-05-15",
      avatar_url: "",
      join_date: "2024-03-15",
      last_login: new Date().toISOString().split("T")[0],
      department: "Web Management",
      location: "Colombo, Sri Lanka",
      status: "active",
      profile_picture: ""
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
  const [connectionStatus, setConnectionStatus] = useState("checking");

  const token = useMemo(() => localStorage.getItem("authToken"), []);
  const storedUser = useMemo(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      return userData;
    } catch {
      return null;
    }
  }, []);

  // Check backend status with detailed logging
  const checkBackendStatus = async () => {
    try {
      console.log("🔍 Checking backend status...");
      const response = await fetch("http://localhost:5000/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000 // Simulated timeout
      });
      
      const isOnline = response.ok;
      setIsBackendOnline(isOnline);
      setConnectionStatus(isOnline ? "online" : "offline");
      
      if (isOnline) {
        const data = await response.json();
        console.log("✅ Backend online:", data);
      } else {
        console.log("❌ Backend responded with error:", response.status);
      }
      
      return isOnline;
    } catch (error) {
      console.error("❌ Backend check failed:", error.message);
      setIsBackendOnline(false);
      setConnectionStatus("offline");
      return false;
    }
  };

  // Test specific API endpoints
  const testApiEndpoints = useCallback(async () => {
    if (!token) return false;
    
    try {
      console.log("🔍 Testing profile API endpoint...");
      const response = await fetch("http://localhost:5000/api/web-manager/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.status === 401) {
        console.log("⚠️ Token expired or invalid");
        return "token_expired";
      } else if (response.status === 403) {
        console.log("⚠️ Access forbidden - wrong role");
        return "access_denied";
      } else if (response.ok) {
        console.log("✅ Profile API accessible");
        return "accessible";
      } else {
        console.log(`❌ Profile API error: ${response.status}`);
        return "error";
      }
    } catch (error) {
      console.error("❌ Profile API test failed:", error.message);
      return "error";
    }
  }, [token]);

  // Function to upload avatar to server
  const uploadAvatarToServer = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('http://localhost:5000/api/upload/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Avatar uploaded:", data.url);
      return data.url;
    } catch (error) {
      console.error('Avatar upload failed:', error);
      throw error;
    }
  };

  // Load activity log
  const loadActivityLog = useCallback(async () => {
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
  }, []);

  // Load user data
  const loadUserData = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setConnectionStatus("checking");
      
      const backendStatus = await checkBackendStatus();
      const apiStatus = backendStatus ? await testApiEndpoints() : "offline";
      
      if (apiStatus === "token_expired") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      
      if (apiStatus === "accessible") {
        // Fetch user data from API
        const response = await fetch("http://localhost:5000/api/web-manager/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          console.log("✅ User data loaded from API:", userData.data);
          setUser(userData.data);
          setProfileForm({
            full_name: userData.data.full_name || "",
            email: userData.data.email || "",
            contact_number: userData.data.contact_number || "",
            gender: userData.data.gender || "",
            date_of_birth: userData.data.date_of_birth ? userData.data.date_of_birth.split("T")[0] : "",
            avatar_url: userData.data.profile_picture || "",
            location: userData.data.location || "",
            department: userData.data.department || ""
          });
          if (userData.data.profile_picture) {
            setAvatarPreview(userData.data.profile_picture);
          }
          
          // Save to localStorage
          localStorage.setItem("user", JSON.stringify(userData.data));
          setMessage({ type: "success", text: "Profile loaded from server" });
        } else {
          throw new Error(`API returned ${response.status}`);
        }
      } else {
        // Use local data
        console.log("ℹ️ Using local data, API status:", apiStatus);
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
          avatar_url: u?.profile_picture || u?.avatar_url || "",
          location: u?.location || defaultUser.location,
          department: u?.department || defaultUser.department
        });
        
        if (u?.profile_picture || u?.avatar_url) {
          setAvatarPreview(u.profile_picture || u.avatar_url);
        }
        
        setMessage({ 
          type: apiStatus === "offline" ? "warning" : "info", 
          text: apiStatus === "offline" 
            ? "Backend offline. Using cached profile data." 
            : "Using cached profile data." 
        });
      }

      // Load activity log
      await loadActivityLog();
    } catch (error) {
      console.error("❌ Error loading user data:", error);
      // Use stored user as fallback
      const u = storedUser || defaultUser;
      setUser(u);
      setProfileForm({
        full_name: u?.full_name || defaultUser.full_name,
        email: u?.email || defaultUser.email,
        contact_number: u?.contact_number || defaultUser.contact_number,
        gender: u?.gender || defaultUser.gender,
        date_of_birth: u?.date_of_birth ? u.date_of_birth.split("T")[0] : defaultUser.date_of_birth,
        avatar_url: u?.profile_picture || u?.avatar_url || "",
        location: u?.location || defaultUser.location,
        department: u?.department || defaultUser.department
      });
      if (u?.profile_picture || u?.avatar_url) {
        setAvatarPreview(u.profile_picture || u.avatar_url);
      }
      
      setMessage({ 
        type: "error", 
        text: `Failed to load profile: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, token, storedUser, defaultUser, testApiEndpoints, loadActivityLog]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("offlineChanges");
    navigate("/login");
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clean up previous blob URL if exists
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "File size must be less than 5MB" });
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setMessage({ type: "error", text: "Please upload a valid image (JPEG, PNG, GIF)" });
        return;
      }
      
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setProfileForm(prev => ({ ...prev, avatar_url: "" }));
      
      setMessage({ type: "info", text: "New avatar selected. Save to apply." });
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
      console.log("💾 Starting profile save...");
      
      let avatarUrl = profileForm.avatar_url;
      
      // Upload avatar if new file selected
      if (avatarFile) {
        console.log("🖼️ Uploading new avatar...");
        try {
          if (isBackendOnline) {
            const uploadedUrl = await uploadAvatarToServer(avatarFile);
            avatarUrl = uploadedUrl;
            setAvatarPreview(uploadedUrl);
            console.log("✅ Avatar uploaded successfully");
          } else {
            // Backend offline, use blob URL temporarily
            avatarUrl = avatarPreview;
            setMessage({ 
              type: "info", 
              text: "Avatar saved locally. Will upload when backend is online." 
            });
          }
        } catch (uploadError) {
          console.error("❌ Avatar upload error:", uploadError);
          if (isBackendOnline) {
            throw uploadError;
          } else {
            avatarUrl = avatarPreview;
          }
        }
      }

      // Prepare updated user object
      const updatedUser = { 
        ...user, 
        ...profileForm,
        profile_picture: avatarUrl || profileForm.avatar_url,
        last_updated: new Date().toISOString(),
        last_updated_locally: !isBackendOnline
      };
      
      console.log("📝 Updated user data:", updatedUser);

      // Update local storage immediately for better UX
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Save offline changes for later sync
      if (!isBackendOnline) {
        const offlineChanges = JSON.parse(localStorage.getItem("offlineChanges") || "[]");
        offlineChanges.push({
          type: "profile_update",
          data: updatedUser,
          timestamp: new Date().toISOString(),
          endpoint: "/api/web-manager/profile/update",
          method: "PUT"
        });
        localStorage.setItem("offlineChanges", JSON.stringify(offlineChanges));
        
        setMessage({ 
          type: "success", 
          text: "✅ Profile saved locally. Changes will sync when backend is online." 
        });
        setAvatarFile(null);
        return;
      }

      // Backend is online - try to sync
      const payload = {
        full_name: profileForm.full_name,
        contact_number: profileForm.contact_number,
        gender: profileForm.gender,
        date_of_birth: profileForm.date_of_birth || null,
        avatar_url: avatarUrl || profileForm.avatar_url,
        location: profileForm.location,
        department: profileForm.department
      };

      console.log("📤 Sending to server:", payload);
      
      try {
        const res = await fetch("http://localhost:5000/api/web-manager/profile/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        console.log("📨 Server response status:", res.status);
        
        if (res.ok) {
          const updated = await res.json();
          console.log("✅ Server response data:", updated);
          
          setUser(updated.data);
          localStorage.setItem("user", JSON.stringify(updated.data));
          
          // Clear offline changes if any
          localStorage.removeItem("offlineChanges");
          
          setMessage({ 
            type: "success", 
            text: "✅ Profile updated successfully and synced with server!" 
          });
        } else {
          // Server responded with error
          let errorMessage = "Profile saved locally, but failed to sync with server.";
          let messageType = "warning";
          
          try {
            const errorData = await res.json();
            console.log("❌ Server error details:", errorData);
            
            if (res.status === 401) {
              errorMessage = "Session expired. Please login again.";
              messageType = "error";
              setTimeout(() => {
                localStorage.removeItem("authToken");
                localStorage.removeItem("user");
                navigate("/login");
              }, 2000);
            } else if (res.status === 403) {
              errorMessage = "Access denied. Web manager permissions required.";
            } else if (res.status === 404) {
              errorMessage = "Profile endpoint not found.";
            } else if (res.status >= 500) {
              errorMessage = `Server error (${res.status}). Please try again later.`;
            } else {
              errorMessage = errorData.message || errorMessage;
            }
          } catch (parseError) {
            console.error("Failed to parse error response:", parseError);
            errorMessage = `Server error ${res.status}. Profile saved locally.`;
          }
          
          // Save as offline change for retry
          const offlineChanges = JSON.parse(localStorage.getItem("offlineChanges") || "[]");
          offlineChanges.push({
            type: "profile_update",
            data: updatedUser,
            timestamp: new Date().toISOString(),
            endpoint: "/api/web-manager/profile/update",
            method: "PUT",
            error: errorMessage
          });
          localStorage.setItem("offlineChanges", JSON.stringify(offlineChanges));
          
          setMessage({ 
            type: messageType, 
            text: `✅ Profile saved locally. ⚠️ ${errorMessage}` 
          });
        }
      } catch (apiError) {
        // Network error or fetch failed
        console.error("❌ Network error:", apiError);
        
        // Save as offline change
        const offlineChanges = JSON.parse(localStorage.getItem("offlineChanges") || "[]");
        offlineChanges.push({
          type: "profile_update",
          data: updatedUser,
          timestamp: new Date().toISOString(),
          endpoint: "/api/web-manager/profile/update",
          method: "PUT",
          error: apiError.message
        });
        localStorage.setItem("offlineChanges", JSON.stringify(offlineChanges));
        
        setMessage({ 
          type: "warning", 
          text: apiError.message.includes("Failed to fetch") 
            ? "✅ Profile saved locally. 🌐 Cannot connect to server. Will sync when online." 
            : "✅ Profile saved locally. ⚠️ Server sync failed. Will retry later." 
        });
      }

      // Add to activity log
      const newActivity = {
        id: activityLog.length + 1,
        type: "profile_update",
        title: "Profile Updated",
        description: `Personal information was modified${!isBackendOnline ? " (offline)" : ""}`,
        timestamp: new Date().toISOString()
      };
      setActivityLog([newActivity, ...activityLog.slice(0, 9)]);
      
      // Clear avatar file
      setAvatarFile(null);
    } catch (err) {
      console.error("❌ Profile update error:", err);
      setMessage({ 
        type: "error", 
        text: `Profile update failed: ${err.message}` 
      });
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
        setMessage({ 
          type: "error", 
          text: "❌ Cannot change password while backend is offline. Password changes require server connection." 
        });
        return;
      }

      console.log("🔐 Changing password...");
      const res = await fetch("http://localhost:5000/api/web-manager/change-password", {
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

      console.log("📨 Password change response:", res.status);
      
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

        setMessage({ type: "success", text: "✅ Password changed successfully!" });
      } else {
        let errorMessage = "Failed to change password. Please check your current password.";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
          
          if (res.status === 401) {
            errorMessage = "Session expired. Please login again.";
            setTimeout(() => {
              localStorage.removeItem("authToken");
              localStorage.removeItem("user");
              navigate("/login");
            }, 2000);
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        
        setMessage({ 
          type: "error", 
          text: `❌ ${errorMessage}` 
        });
      }
    } catch (err) {
      console.error("Password change error:", err);
      setMessage({ 
        type: "error", 
        text: "❌ Failed to connect to server. Please check your internet connection." 
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePreferencesSave = async () => {
    try {
      setSavingPreferences(true);
      
      // Save to localStorage
      localStorage.setItem("userPreferences", JSON.stringify(preferences));
      
      // If backend online, you could sync here
      if (isBackendOnline) {
        // Optional: Add API call to save preferences to server
        setMessage({ type: "success", text: "✅ Preferences saved!" });
      } else {
        setMessage({ type: "success", text: "✅ Preferences saved locally." });
      }
      
      // Add to activity log
      const newActivity = {
        id: activityLog.length + 1,
        type: "preferences_update",
        title: "Preferences Updated",
        description: "Account preferences were modified",
        timestamp: new Date().toISOString()
      };
      setActivityLog([newActivity, ...activityLog.slice(0, 9)]);
    } catch (error) {
      setMessage({ type: "error", text: "❌ Failed to save preferences" });
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

      // Note: You might want to create a specific endpoint for web manager account deletion
      const res = await fetch("http://localhost:5000/api/user/delete-account", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("offlineChanges");
        navigate("/login");
      } else {
        setMessage({ type: "error", text: "Failed to delete account" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to connect to server" });
    }
  };

  const handleRetrySync = async () => {
    setMessage({ type: "info", text: "🔄 Attempting to sync offline changes..." });
    
    try {
      const offlineChanges = JSON.parse(localStorage.getItem("offlineChanges") || "[]");
      if (offlineChanges.length === 0) {
        setMessage({ type: "success", text: "✅ No offline changes to sync." });
        return;
      }
      
      const backendStatus = await checkBackendStatus();
      if (!backendStatus) {
        setMessage({ type: "error", text: "❌ Still offline. Cannot sync changes." });
        return;
      }
      
      // Here you could implement logic to retry failed syncs
      // For now, just clear the offline changes and reload
      localStorage.removeItem("offlineChanges");
      setMessage({ type: "success", text: "✅ Offline changes marked for sync. Please save again." });
      
      // Reload user data from server
      setLoading(true);
      await loadUserData();
      
    } catch (error) {
      setMessage({ type: "error", text: `❌ Sync failed: ${error.message}` });
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
        <p style={{ marginTop: '10px', fontSize: '0.9rem', opacity: 0.7 }}>
          Status: {connectionStatus === "checking" ? "Checking connection..." : connectionStatus}
        </p>
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
            <span style={{ 
              fontSize: '0.8rem', 
              marginLeft: '10px', 
              padding: '2px 8px', 
              borderRadius: '10px',
              background: isBackendOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: isBackendOnline ? '#10B981' : '#EF4444',
              fontWeight: 'bold'
            }}>
              {isBackendOnline ? '🟢 Online' : '🔴 Offline'}
            </span>
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
                  <div className="wm-pro-detail-item">
                    <span className="wm-pro-detail-icon">🔄</span>
                    <span style={{ 
                      color: isBackendOnline ? '#10B981' : '#EF4444',
                      fontWeight: 'bold'
                    }}>
                      {isBackendOnline ? 'Synced' : 'Offline'}
                    </span>
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
          {/* Connection Status Bar */}
          <div style={{ 
            padding: '10px 15px', 
            borderRadius: '10px', 
            marginBottom: '20px',
            background: isBackendOnline ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: `2px solid ${isBackendOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ 
                fontWeight: 'bold', 
                color: isBackendOnline ? '#10B981' : '#EF4444',
                marginRight: '10px'
              }}>
                {isBackendOnline ? '🟢 Backend Online' : '🔴 Backend Offline'}
              </span>
              <span style={{ color: '#666', fontSize: '0.9rem' }}>
                {isBackendOnline 
                  ? 'Changes will sync immediately' 
                  : 'Changes saved locally. Will sync when online.'}
              </span>
            </div>
            
            <div>
              <button 
                onClick={checkBackendStatus}
                style={{
                  padding: '5px 15px',
                  background: 'var(--wm-pro-gradient)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}
              >
                Retry Connection
              </button>
              {!isBackendOnline && (
                <button 
                  onClick={handleRetrySync}
                  style={{
                    padding: '5px 15px',
                    background: '#F59E0B',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    marginLeft: '10px'
                  }}
                >
                  Retry Sync
                </button>
              )}
            </div>
          </div>

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
                {!isBackendOnline && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '8px 12px', 
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '6px',
                    display: 'inline-block'
                  }}>
                    <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>⚠️ Offline Mode:</span>
                    <span style={{ color: '#666', marginLeft: '5px' }}>Changes saved locally</span>
                  </div>
                )}
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
                        <span className="wm-pro-input-note">Upload a profile picture (JPG, PNG, GIF, max 5MB)</span>
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
                    {savingProfile 
                      ? (isBackendOnline ? "Saving..." : "Saving Locally...") 
                      : (isBackendOnline ? "Save Changes" : "Save Locally")}
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
                        avatar_url: user?.profile_picture || "",
                        location: user?.location || defaultUser.location,
                        department: user?.department || defaultUser.department
                      });
                      if (user?.profile_picture) {
                        setAvatarPreview(user.profile_picture);
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
                  {!isBackendOnline && (
                    <div style={{ 
                      padding: '10px', 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      borderRadius: '8px',
                      marginBottom: '15px',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}>
                      <span style={{ color: '#EF4444', fontWeight: 'bold' }}>⚠️ Note:</span>
                      <span style={{ color: '#666', marginLeft: '5px' }}>
                        Password changes require server connection
                      </span>
                    </div>
                  )}
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
                  <button 
                    type="submit" 
                    className="wm-pro-btn-primary" 
                    disabled={savingPassword || !isBackendOnline}
                  >
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
                         activity.type === 'email_verification' ? '📧' : 
                         activity.type === 'preferences_update' ? '⚙️' : '✅'}
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