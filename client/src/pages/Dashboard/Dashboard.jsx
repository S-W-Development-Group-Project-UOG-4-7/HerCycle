import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

import { getCycleProfile, getCycleHistory } from "../../services/cycleApi";
import CycleOverviewWidget from "../../components/cycle/CycleOverviewWidget";
import CycleTrackingTab from "./tabs/CycleTrackingTab";
import CycleHealthInsightsTab from "./tabs/CycleHealthInsightsTab";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cycleProfile, setCycleProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => ([
    {
      id: 'n1',
      title: 'New comment on your post',
      message: 'A community member replied to your discussion.',
      time: '2m ago',
      read: false
    },
    {
      id: 'n2',
      title: 'Doctor article posted',
      message: 'Dr. HerCycle Doctor shared a new article on cycle health.',
      time: '1h ago',
      read: false
    },
    {
      id: 'n3',
      title: 'Follow suggestion',
      message: 'New gynecologist joined the community.',
      time: 'Yesterday',
      read: true
    }
  ]));
  const notificationRef = useRef(null);

  useEffect(() => {
    // Fetch user data from localStorage or API
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      navigate("/login");
      return;
    }

    setUser(userData);

    // Check if user has cycle tracking enabled
    const nic = userData?.NIC || userData?.nic || userData?.user_nic;

    if (userData.is_cycle_user && nic) {
      fetchCycleProfile(nic);
      fetchCycleHistory(nic);
    }

    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (!isNotificationsOpen) return;
    const handleOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isNotificationsOpen]);

  const [dailyLogs, setDailyLogs] = useState([]);
  const [cycleTrackers, setCycleTrackers] = useState([]);

  const fetchCycleHistory = async (nic) => {
    try {
      const history = await getCycleHistory(nic);
      setDailyLogs(history?.daily_logs || []);
      setCycleTrackers(history?.cycle_trackers || []);
    } catch (e) {
      console.error("Error fetching cycle history:", e);
    }
  };

  const periodFormRef = useRef(null);
  const dailyLogRef = useRef(null);

  const goToPeriodForm = () => {
    setActiveTab("cycle-tracking");
    setTimeout(() => periodFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const goToDailyLog = () => {
    setActiveTab("cycle-tracking");
    setTimeout(() => dailyLogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };


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

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
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
          {(user?.role === 'doctor' || user?.user_type === 'doctor') && (
            <button className="switch-dashboard-btn" onClick={() => navigate('/doctor-dashboard')}>
              <span>🩺</span>
              <span>Switch to Doctor Dashboard</span>
            </button>
          )}
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
            <div className="notification-wrap" ref={notificationRef}>
              <button
                type="button"
                className={`notification-btn ${isNotificationsOpen ? 'active' : ''}`}
                onClick={toggleNotifications}
                aria-expanded={isNotificationsOpen}
                aria-label="Notifications"
              >
                <span className="notification-icon">🔔</span>
                {unreadCount > 0 && (
                  <span className="notification-count">{unreadCount}</span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="notification-panel" role="menu">
                  <div className="notification-panel-header">
                    <span className="notification-panel-title">Notifications</span>
                    <div className="notification-panel-actions">
                      <button
                        type="button"
                        className="notification-panel-action"
                        onClick={markAllNotificationsRead}
                      >
                        Mark all read
                      </button>
                      <button
                        type="button"
                        className="notification-panel-action"
                        onClick={clearNotifications}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="notification-empty">No notifications yet.</div>
                  ) : (
                    <div className="notification-list">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                          onClick={() => markNotificationRead(notification.id)}
                        >
                          <span className="notification-indicator"></span>
                          <div className="notification-content">
                            <div className="notification-title">{notification.title}</div>
                            <div className="notification-text">{notification.message}</div>
                            <div className="notification-time">{notification.time}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  <button type="button" className="notification-footer">
                    View all notifications
                  </button>
                </div>
              )}
            </div>
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
              {user?.is_cycle_user && (
                <CycleOverviewWidget
                  cycleProfile={cycleProfile}
                  cycleTrackers={cycleTrackers}
                  dailyLogs={dailyLogs}
                  onGoToPeriod={goToPeriodForm}
                  onGoToDailyLog={goToDailyLog}
                />
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
            <CycleTrackingTab
              user={user}
              cycleProfile={cycleProfile}
              periodFormRef={periodFormRef}
              dailyLogRef={dailyLogRef}
              dailyLogs={dailyLogs}
              setDailyLogs={setDailyLogs}
              cycleTrackers={cycleTrackers}
              setCycleTrackers={setCycleTrackers}
            />

          )}

          {/* Community Tab */}
          {activeTab === "community" && <CommunityTab user={user} />}

          {/* Health Insights Tab (only visible if cycle tracking enabled) */}
          {activeTab === "health-insights" && user?.is_cycle_user && (
            <HealthInsightsTab cycleProfile={cycleProfile} cycleTrackers={cycleTrackers} />
          )}



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
const CommunityTab = ({ user }) => {
  const [contentMode, setContentMode] = useState('articles');
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postLoading, setPostLoading] = useState(true);
  const [postSearch, setPostSearch] = useState('');
  const [postSort, setPostSort] = useState('newest');
  const [postPage, setPostPage] = useState(1);
  const [postPagination, setPostPagination] = useState(null);
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
    isAnonymous: false
  });
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postError, setPostError] = useState('');
  const [doctorSuggestions, setDoctorSuggestions] = useState([]);
  const [followedDoctors, setFollowedDoctors] = useState(() => {
    try {
      const raw = localStorage.getItem('followedDoctors');
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.map(item => (item || '').toString().trim().toLowerCase()).filter(Boolean);
    } catch {
      return [];
    }
  });

  const token = localStorage.getItem('authToken');
  const API = 'http://localhost:5000/api/community/articles';
  const POSTS_API = 'http://localhost:5000/api/posts';
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const savedKey = 'savedArticles';
  const savedMetaKey = 'savedArticlesMeta';
  const followKey = 'followedDoctors';
  const postTitleRef = useRef(null);

  const getSavedIds = () => {
    try {
      const raw = localStorage.getItem(savedKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getSavedMeta = () => {
    try {
      const raw = localStorage.getItem(savedMetaKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const setSavedMeta = (items) => {
    localStorage.setItem(savedMetaKey, JSON.stringify(items));
  };

  const buildSavedMeta = (article) => ({
    id: article._id,
    title: article.title || 'Untitled',
    author: article.author?.name || 'Doctor',
    time: article.publishedAt || article.createdAt || '',
    tags: Array.isArray(article.tags) ? article.tags : []
  });

  const toggleSave = (articleId) => {
    const current = new Set(getSavedIds());
    const meta = getSavedMeta();
    const articleMatch = articles.find(article => article._id === articleId)
      || (selectedArticle && selectedArticle._id === articleId ? selectedArticle : null);
    let updatedMeta = meta;
    if (current.has(articleId)) {
      current.delete(articleId);
      updatedMeta = meta.filter(item => item && item.id !== articleId);
    } else {
      current.add(articleId);
      if (articleMatch) {
        const without = meta.filter(item => item && item.id !== articleId);
        updatedMeta = [...without, buildSavedMeta(articleMatch)];
      }
    }
    const updated = Array.from(current);
    localStorage.setItem(savedKey, JSON.stringify(updated));
    if (updatedMeta !== meta) {
      setSavedMeta(updatedMeta);
    }
    setArticles(prev => prev.map(a => (
      a._id === articleId ? { ...a, isSaved: current.has(articleId) } : a
    )));
    if (selectedArticle && selectedArticle._id === articleId) {
      setSelectedArticle(prev => ({ ...prev, isSaved: current.has(articleId) }));
    }
  };

  const getFollowKey = (name) => {
    const raw = (name || '').toString().trim().toLowerCase();
    return raw.replace(/^dr\.?\s+/, '');
  };

  const toggleFollow = (doctorName) => {
    const key = getFollowKey(doctorName);
    if (!key) return;
    let updated;
    if (followedDoctors.includes(key)) {
      updated = followedDoctors.filter(name => name !== key);
    } else {
      updated = [...followedDoctors, key];
    }
    setFollowedDoctors(updated);
    localStorage.setItem(followKey, JSON.stringify(updated));
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, sort });
      if (search) params.set('search', search);
      const res = await fetch(`${API}?${params}`, { headers });
      const data = await res.json();
      if (data.success) {
        const savedIds = new Set(getSavedIds());
        const enriched = data.data.map(article => ({
          ...article,
          isSaved: savedIds.has(article._id)
        }));
        setArticles(enriched);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
    setLoading(false);
  };

  const fetchDoctorSuggestions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/community/doctor-suggestions?limit=8');
      const data = await res.json();
      if (data.success) {
        setDoctorSuggestions(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching doctor suggestions:', err);
    }
  };

  const fetchPosts = async () => {
    setPostLoading(true);
    try {
      const params = new URLSearchParams({ page: postPage, limit: 8, sort: postSort });
      if (postSearch) params.set('search', postSearch);
      const res = await fetch(`${POSTS_API}?${params}`, { headers });
      const data = await res.json();
      if (data.success) {
        setPosts(data.data || []);
        setPostPagination(data.pagination || null);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
    setPostLoading(false);
  };

  const handlePostSearch = (e) => {
    e.preventDefault();
    setPostPage(1);
    fetchPosts();
  };

  const openPost = async (id) => {
    try {
      const res = await fetch(`${POSTS_API}/${id}`, { headers });
      const data = await res.json();
      if (data.success) {
        setSelectedPost(data.data);
      }
    } catch (err) {
      console.error('Error fetching post:', err);
    }
  };

  const handlePostLike = async (postId) => {
    if (!token) return alert('Please log in to like posts.');
    try {
      const res = await fetch(`${POSTS_API}/${postId}/like`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.map(p => (
          p._id === postId ? { ...p, like_count: data.likes, isLiked: data.liked } : p
        )));
        if (selectedPost && selectedPost._id === postId) {
          setSelectedPost(prev => ({ ...prev, like_count: data.likes, isLiked: data.liked }));
        }
      }
    } catch (err) {
      console.error('Error toggling post like:', err);
    }
  };

  const submitPost = async () => {
    if (!token) {
      alert('Please log in to create a post.');
      return;
    }
    const title = postForm.title.trim();
    const content = postForm.content.trim();
    if (!title || !content) {
      setPostError('Title and content are required.');
      return;
    }
    setPostSubmitting(true);
    setPostError('');
    try {
      const payload = {
        title,
        content,
        category: postForm.category,
        tags: postForm.tags,
        is_anonymous: postForm.isAnonymous
      };
      const res = await fetch(POSTS_API, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setPostForm({ title: '', content: '', category: 'general', tags: '', isAnonymous: false });
        if (postPage === 1 && postSort === 'newest') {
          setPosts(prev => [data.data, ...prev]);
        } else {
          fetchPosts();
        }
      } else {
        setPostError(data.message || 'Failed to create post.');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setPostError('Failed to create post.');
    }
    setPostSubmitting(false);
  };

  const bumpPostCommentCount = (postId) => {
    setPosts(prev => prev.map(p => (
      p._id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p
    )));
    setSelectedPost(prev => (
      prev && prev._id === postId
        ? { ...prev, comment_count: (prev.comment_count || 0) + 1 }
        : prev
    ));
  };

  useEffect(() => {
    if (contentMode !== 'articles') return;
    fetchArticles();
  }, [contentMode, page, sort]);

  useEffect(() => {
    if (contentMode !== 'posts') return;
    fetchPosts();
  }, [contentMode, postPage, postSort]);

  useEffect(() => {
    fetchDoctorSuggestions();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchArticles();
  };

  const handleLike = async (articleId) => {
    if (!token) return alert('Please log in to like articles.');
    try {
      const res = await fetch(`${API}/${articleId}/like`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setArticles(prev => prev.map(a =>
          a._id === articleId ? { ...a, likes: data.likes, isLiked: data.liked } : a
        ));
        if (selectedArticle && selectedArticle._id === articleId) {
          setSelectedArticle(prev => ({ ...prev, likes: data.likes, isLiked: data.liked }));
        }
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const openArticle = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, { headers });
      const data = await res.json();
      if (data.success) {
        const savedIds = new Set(getSavedIds());
        setSelectedArticle({ ...data.data, isSaved: savedIds.has(data.data._id) });
      }
    } catch (err) {
      console.error('Error fetching article:', err);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    const first = parts[0]?.charAt(0) || '';
    const second = parts[1]?.charAt(0) || '';
    return `${first}${second}`.toUpperCase() || 'U';
  };

  const getHue = (value) => {
    if (!value) return 180;
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash + value.charCodeAt(i) * 7) % 360;
    }
    return hash;
  };

  const formatCategory = (value) => {
    if (!value) return 'General';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const tagCounts = {};
  const authorCounts = {};
  articles.forEach((article) => {
    (article.tags || []).forEach((tag) => {
      const cleanTag = tag.trim();
      if (!cleanTag) return;
      tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
    });
    if (article.author?.name) {
      const key = article.author.name;
      if (!authorCounts[key]) {
        authorCounts[key] = {
          name: key,
          specialization: article.author?.specialization || article.author?.specialty || 'Doctor',
          count: 0
        };
      }
      authorCounts[key].count += 1;
    }
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const fallbackTags = ['cycle care', 'hormone health', 'nutrition', 'self care', 'ask a doctor'];
  const trendTags = topTags.length ? topTags : fallbackTags.map(tag => [tag, null]);

  const topAuthors = Object.values(authorCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  const savedIds = getSavedIds();
  const savedArticles = articles.filter(article => article.isSaved);
  const extraSavedCount = Math.max(0, savedIds.length - savedArticles.length);
  const followSuggestions = (() => {
    const combined = [];
    const seen = new Set();
    const pushUnique = (item) => {
      if (!item || !item.name) return;
      if (seen.has(item.name)) return;
      seen.add(item.name);
      combined.push(item);
    };
    topAuthors.forEach(pushUnique);
    doctorSuggestions.forEach(pushUnique);
    return combined.slice(0, 4);
  })();

  const postTagCounts = {};
  posts.forEach((post) => {
    (post.tags || []).forEach((tag) => {
      const cleanTag = tag.trim();
      if (!cleanTag) return;
      postTagCounts[cleanTag] = (postTagCounts[cleanTag] || 0) + 1;
    });
  });

  const postTopTags = Object.entries(postTagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const postFallbackTags = ['first period', 'cycle pain', 'self care', 'question', 'support'];
  const postTrendTags = postTopTags.length ? postTopTags : postFallbackTags.map(tag => [tag, null]);

  if (contentMode === 'posts' && selectedPost) {
    return (
      <div className="community-tab social-community">
        <div className="social-mode">
          <button
            type="button"
            className={`social-mode-btn ${contentMode === 'articles' ? 'active' : ''}`}
            onClick={() => { setContentMode('articles'); setSelectedPost(null); }}
          >
            Doctor Articles
          </button>
          <button
            type="button"
            className={`social-mode-btn ${contentMode === 'posts' ? 'active' : ''}`}
            onClick={() => { setContentMode('posts'); setSelectedArticle(null); }}
          >
            Community Posts
          </button>
        </div>
        <PostDetail
          post={selectedPost}
          onBack={() => setSelectedPost(null)}
          onLike={handlePostLike}
          onCommentAdded={bumpPostCommentCount}
          timeAgo={timeAgo}
          token={token}
          headers={headers}
        />
      </div>
    );
  }

  if (contentMode === 'posts') {
    return (
      <div className="community-tab social-community">
        <div className="social-layout">
          <section className="social-main">
            <div className="social-hero">
              <div>
                <span className="social-eyebrow">Community</span>
                <h2 className="social-title">Stories, questions, and support</h2>
                <p className="social-subtitle">
                  Share lived experience, ask questions, and get support from the community.
                </p>
              </div>
              <div className="social-mode">
                <button
                  type="button"
                  className={`social-mode-btn ${contentMode === 'articles' ? 'active' : ''}`}
                  onClick={() => { setContentMode('articles'); setSelectedPost(null); }}
                >
                  Doctor Articles
                </button>
                <button
                  type="button"
                  className={`social-mode-btn ${contentMode === 'posts' ? 'active' : ''}`}
                  onClick={() => { setContentMode('posts'); setSelectedArticle(null); }}
                >
                  Community Posts
                </button>
              </div>
              <div className="social-tabs">
                <button
                  className={`social-tab ${postSort === 'newest' ? 'active' : ''}`}
                  onClick={() => { setPostSort('newest'); setPostPage(1); }}
                >
                  Latest
                </button>
                <button
                  className={`social-tab ${postSort === 'popular' ? 'active' : ''}`}
                  onClick={() => { setPostSort('popular'); setPostPage(1); }}
                >
                  Popular
                </button>
                <button
                  className={`social-tab ${postSort === 'most_commented' ? 'active' : ''}`}
                  onClick={() => { setPostSort('most_commented'); setPostPage(1); }}
                >
                  Discussed
                </button>
              </div>
            </div>

            <div className="social-toolbar">
              <form onSubmit={handlePostSearch} className="social-search">
                <input
                  type="text"
                  placeholder="Search community posts..."
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                />
              </form>
              <button
                className="social-cta"
                type="button"
                onClick={() => { if (postTitleRef.current) postTitleRef.current.focus(); }}
              >
                Share a Story
              </button>
            </div>

            <div className="post-composer">
              <h3>Start a post</h3>
              <input
                ref={postTitleRef}
                type="text"
                placeholder="Post title"
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              />
              <textarea
                rows="4"
                placeholder="Share your story or ask a question..."
                value={postForm.content}
                onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
              />
              <div className="post-composer-row">
                <select
                  value={postForm.category}
                  onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="health">Health</option>
                  <option value="education">Education</option>
                  <option value="experience">Experience</option>
                  <option value="question">Question</option>
                  <option value="support">Support</option>
                </select>
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={postForm.tags}
                  onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })}
                />
              </div>
              <label className="post-anon-toggle">
                <input
                  type="checkbox"
                  checked={postForm.isAnonymous}
                  onChange={(e) => setPostForm({ ...postForm, isAnonymous: e.target.checked })}
                />
                Post anonymously
              </label>
              {postError && <div className="post-error">{postError}</div>}
              <div className="post-composer-actions">
                <button
                  className="social-cta"
                  type="button"
                  onClick={submitPost}
                  disabled={postSubmitting}
                >
                  {postSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>

            {postLoading ? (
              <div className="social-loading">
                <div className="social-loader"></div>
                <p>Loading community posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="social-empty">
                <p>No posts yet. Be the first to share your story.</p>
              </div>
            ) : (
              <div className="social-feed">
                {posts.map((post, index) => {
                  const authorName = post.author?.name || 'Community Member';
                  const authorLabel = post.is_anonymous ? 'Anonymous' : authorName;
                  const excerpt = post.content && post.content.length > 180
                    ? `${post.content.slice(0, 180)}...`
                    : (post.content || '');
                  return (
                    <article
                      key={post._id}
                      className="social-post post-card"
                      style={{ '--i': index }}
                    >
                      <div
                        className="social-avatar"
                        style={{ '--avatar-hue': getHue(authorLabel) }}
                      >
                        {getInitials(authorLabel)}
                      </div>
                      <div className="social-post-body" onClick={() => openPost(post._id)}>
                        <div className="social-post-header">
                          <div className="social-post-author">
                            <span className="social-post-name">
                              {post.author_type === 'doctor' && !post.is_anonymous ? 'Dr. ' : ''}{authorLabel}
                            </span>
                            {post.is_anonymous && <span className="social-post-pill">Anonymous</span>}
                            <span className="social-dot">-</span>
                            <span className="social-post-time">{timeAgo(post.created_at)}</span>
                          </div>
                        </div>

                        <div className="social-post-meta">
                          <span className="social-post-category">Community Post</span>
                          <span className="social-post-specialty">{formatCategory(post.category)}</span>
                        </div>

                        <h3 className="social-post-title">{post.title}</h3>
                        <p className="social-post-excerpt">{excerpt}</p>

                        {post.media_url && post.media_type === 'image' && (
                          <div className="social-post-media">
                            <img src={post.media_url} alt={post.title} />
                          </div>
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <div className="social-post-tags">
                            {post.tags.map((tag, i) => (
                              <span key={i} className="social-tag">#{tag}</span>
                            ))}
                          </div>
                        )}

                        <div className="social-post-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className={`social-action like ${post.isLiked ? 'active' : ''}`}
                            onClick={() => handlePostLike(post._id)}
                          >
                            <span className="social-icon">Like</span>
                            {post.like_count || 0}
                          </button>
                          <button
                            type="button"
                            className="social-action"
                            onClick={() => openPost(post._id)}
                          >
                            <span className="social-icon">Comment</span>
                            {post.comment_count || 0}
                          </button>
                          <span className="social-action static">
                            <span className="social-icon">Views</span>
                            {post.view_count || 0}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {postPagination && postPagination.pages > 1 && (
              <div className="social-pagination">
                <button disabled={postPage <= 1} onClick={() => setPostPage(p => p - 1)}>Prev</button>
                <span>Page {postPage} of {postPagination.pages}</span>
                <button disabled={postPage >= postPagination.pages} onClick={() => setPostPage(p => p + 1)}>Next</button>
              </div>
            )}
          </section>

          <aside className="social-side">
            <div className="social-side-card">
              <h4>Trending Topics</h4>
              <div className="social-trend-list">
                {postTrendTags.map(([tag, count]) => (
                  <button type="button" key={tag} className="social-trend">
                    <div>
                      <span className="social-trend-tag">#{tag}</span>
                      <span className="social-trend-meta">{count ? `${count} posts` : 'New conversations'}</span>
                    </div>
                    <span className="social-trend-arrow">&gt;</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="social-side-card highlight">
              <h4>Community Guide</h4>
              <p>
                Keep it kind. Share lived experience, cite sources when you can, and uplift
                each other with practical, compassionate advice.
              </p>
              <button type="button" className="social-ghost-btn full">View Guidelines</button>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (selectedArticle) {
    return (
      <div className="community-tab social-community">
        <div className="social-mode">
          <button
            type="button"
            className={`social-mode-btn ${contentMode === 'articles' ? 'active' : ''}`}
            onClick={() => { setContentMode('articles'); setSelectedPost(null); }}
          >
            Doctor Articles
          </button>
          <button
            type="button"
            className={`social-mode-btn ${contentMode === 'posts' ? 'active' : ''}`}
            onClick={() => { setContentMode('posts'); setSelectedArticle(null); }}
          >
            Community Posts
          </button>
        </div>
        <ArticleDetail
          article={selectedArticle}
          onBack={() => setSelectedArticle(null)}
          onLike={handleLike}
          onSave={toggleSave}
          timeAgo={timeAgo}
          token={token}
          headers={headers}
        />
      </div>
    );
  }

  return (
    <div className="community-tab social-community">
      <div className="social-layout">
        <section className="social-main">
          <div className="social-hero">
            <div>
              <span className="social-eyebrow">Community</span>
              <h2 className="social-title">Articles & real conversations</h2>
              <p className="social-subtitle">
                Verified doctors and community members sharing insights, lived experience,
                and practical guidance for better cycle health.
              </p>
            </div>
            <div className="social-mode">
              <button
                type="button"
                className={`social-mode-btn ${contentMode === 'articles' ? 'active' : ''}`}
                onClick={() => { setContentMode('articles'); setSelectedPost(null); }}
              >
                Doctor Articles
              </button>
              <button
                type="button"
                className={`social-mode-btn ${contentMode === 'posts' ? 'active' : ''}`}
                onClick={() => { setContentMode('posts'); setSelectedArticle(null); }}
              >
                Community Posts
              </button>
            </div>
            <div className="social-tabs">
              <button
                className={`social-tab ${sort === 'popular' ? 'active' : ''}`}
                onClick={() => { setSort('popular'); setPage(1); }}
              >
                For You
              </button>
              <button
                className={`social-tab ${sort === 'newest' ? 'active' : ''}`}
                onClick={() => { setSort('newest'); setPage(1); }}
              >
                Latest
              </button>
              <button
                className={`social-tab ${sort === 'most_viewed' ? 'active' : ''}`}
                onClick={() => { setSort('most_viewed'); setPage(1); }}
              >
                Top
              </button>
            </div>
          </div>

          <div className="social-toolbar">
            <form onSubmit={handleSearch} className="social-search">
              <input
                type="text"
                placeholder="Search articles, tags, doctors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <button className="social-cta" type="button">Ask a Doctor</button>
          </div>
          {loading ? (
            <div className="social-loading">
              <div className="social-loader"></div>
              <p>Loading community articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="social-empty">
              <p>No articles yet. Be the first to start a conversation!</p>
            </div>
          ) : (
            <div className="social-feed">
              {articles.map((article, index) => {
                const authorName = article.author?.name || 'HerCycle Doctor';
                const authorSpecialization = article.author?.specialization || article.author?.specialty || 'Doctor';
                return (
                  <article
                    key={article._id}
                    className="social-post"
                    style={{ '--i': index }}
                  >
                    <div
                      className="social-avatar"
                      style={{ '--avatar-hue': getHue(authorName) }}
                    >
                      {getInitials(authorName)}
                    </div>
                    <div className="social-post-body" onClick={() => openArticle(article._id)}>
                      <div className="social-post-header">
                        <div className="social-post-author">
                          <span className="social-post-name">Dr. {authorName}</span>
                          <span className="social-post-pill">Verified</span>
                          <span className="social-dot">-</span>
                          <span className="social-post-time">{timeAgo(article.publishedAt || article.createdAt)}</span>
                        </div>
                        <div className="social-post-header-actions">
                          <button
                            type="button"
                            className={`social-follow-toggle ${followedDoctors.includes(getFollowKey(authorName)) ? 'following' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFollow(authorName);
                            }}
                          >
                            {followedDoctors.includes(getFollowKey(authorName)) ? 'Following' : 'Follow'}
                          </button>
                          <button
                            type="button"
                            className="social-ghost-btn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            ...
                          </button>
                        </div>
                      </div>

                      <div className="social-post-meta">
                        <span className="social-post-category">Doctor Article</span>
                        <span className="social-post-specialty">{authorSpecialization}</span>
                      </div>

                      <h3 className="social-post-title">{article.title}</h3>
                      <p className="social-post-excerpt">{article.excerpt}</p>

                      {article.featuredImage && (
                        <div className="social-post-media">
                          <img src={article.featuredImage} alt={article.title} />
                        </div>
                      )}

                      {article.tags && article.tags.length > 0 && (
                        <div className="social-post-tags">
                          {article.tags.map((tag, i) => (
                            <span key={i} className="social-tag">#{tag}</span>
                          ))}
                        </div>
                      )}

                      <div className="social-post-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className={`social-action like ${article.isLiked ? 'active' : ''}`}
                          onClick={() => handleLike(article._id)}
                        >
                          <span className="social-icon">Like</span>
                          {article.likes}
                        </button>
                        <button
                          type="button"
                          className="social-action"
                          onClick={() => openArticle(article._id)}
                        >
                          <span className="social-icon">Comment</span>
                          {article.commentCount ?? 0}
                        </button>
                        <span className="social-action static">
                          <span className="social-icon">Views</span>
                          {article.views}
                        </span>
                        <button type="button" className="social-action">
                          <span className="social-icon">Share</span>
                        </button>
                        <button
                          type="button"
                          className={`social-action ${article.isSaved ? 'saved' : ''}`}
                          onClick={() => toggleSave(article._id)}
                        >
                          <span className="social-icon">Save</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="social-pagination">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              <span>Page {page} of {pagination.pages}</span>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </section>

        <aside className="social-side">
          <div className="social-side-card">
            <h4>Trending Topics</h4>
            <div className="social-trend-list">
              {trendTags.map(([tag, count]) => (
                <button type="button" key={tag} className="social-trend">
                  <div>
                    <span className="social-trend-tag">#{tag}</span>
                    <span className="social-trend-meta">{count ? `${count} posts` : 'New conversations'}</span>
                  </div>
                  <span className="social-trend-arrow">{'>'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="social-side-card">
            <h4>Who to follow</h4>
            {followSuggestions.length === 0 ? (
              <p className="social-side-empty">Follow suggestions will appear as new doctors post.</p>
            ) : (
              <div className="social-follow-list">
                {followSuggestions.map((author) => (
                  <div key={author.name} className="social-follow-item">
                    <div
                      className="social-avatar small"
                      style={{ '--avatar-hue': getHue(author.name) }}
                    >
                      {getInitials(author.name)}
                    </div>
                    <div>
                      <div className="social-follow-name">Dr. {author.name}</div>
                      <div className="social-follow-role">{author.specialization}</div>
                    </div>
                    <button
                      type="button"
                      className={`social-follow-btn ${followedDoctors.includes(getFollowKey(author.name)) ? 'following' : ''}`}
                      onClick={() => toggleFollow(author.name)}
                    >
                      {followedDoctors.includes(getFollowKey(author.name)) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="social-side-card">
            <h4>Saved Posts</h4>
            {savedArticles.length === 0 ? (
              <p className="social-side-empty">Save posts to read them later.</p>
            ) : (
              <div className="social-saved-list">
                {savedArticles.map((article) => (
                  <div key={article._id} className="social-saved-item">
                    <button
                      type="button"
                      className="social-saved-link"
                      onClick={() => openArticle(article._id)}
                    >
                      <span className="social-saved-title">{article.title}</span>
                      <span className="social-saved-meta">{timeAgo(article.publishedAt || article.createdAt)}</span>
                    </button>
                    <button
                      type="button"
                      className="social-saved-remove"
                      onClick={() => toggleSave(article._id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {extraSavedCount > 0 && (
                  <div className="social-saved-more">+{extraSavedCount} more saved</div>
                )}
              </div>
            )}
          </div>

          <div className="social-side-card highlight">
            <h4>Community Guide</h4>
            <p>
              Keep it kind. Share lived experience, cite sources when you can, and uplift
              each other with practical, compassionate advice.
            </p>
            <button type="button" className="social-ghost-btn full">View Guidelines</button>
          </div>

        </aside>
      </div>
    </div>
  );
};

const ArticleDetail = ({ article, onBack, onLike, onSave, timeAgo, token, headers }) => {
  const [comments, setComments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('comment');
  const [modalText, setModalText] = useState('');
  const [modalTarget, setModalTarget] = useState(null);
  const API = 'http://localhost:5000/api/community/articles';
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API}/${article._id}/comments`);
      const data = await res.json();
      if (data.success) setComments(data.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  useEffect(() => { fetchComments(); }, [article._id]);

  const submitComment = async (text, parentCommentId) => {
    if (!token) return alert('Please log in to comment.');
    if (!text.trim()) return;
    try {
      const res = await fetch(`${API}/${article._id}/comments`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, parentCommentId })
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => [...prev, data.data]);
        setModalText('');
        setModalTarget(null);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const canModifyComment = (comment) => {
    if (!currentUser) return false;
    if (comment.author_nic && currentUser.NIC === comment.author_nic) return true;
    return currentUser.role === 'admin' || currentUser.role === 'web_manager';
  };

  const openModal = (mode, target = null) => {
    setModalMode(mode);
    setModalTarget(target);
    setModalText(mode === 'edit' && target ? target.text : '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalText('');
    setModalTarget(null);
  };

  const updateComment = async (commentId, text) => {
    if (!token) return alert('Please log in to edit comments.');
    if (!text.trim()) return;
    try {
      const res = await fetch(`${API}/${article._id}/comments/${commentId}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => prev.map(c => (c._id === commentId ? { ...c, text: data.data.text, updated_at: data.data.updated_at } : c)));
        closeModal();
      }
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  const deleteComment = async (commentId) => {
    if (!token) return alert('Please log in to delete comments.');
    try {
      const res = await fetch(`${API}/${article._id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => prev.filter(c => c._id !== commentId && c.parent_comment_id !== commentId));
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const submitModal = () => {
    if (modalMode === 'edit' && modalTarget) {
      updateComment(modalTarget._id, modalText);
      return;
    }
    const parentId = modalMode === 'reply' && modalTarget
      ? (modalTarget.parent_comment_id || modalTarget._id)
      : null;
    submitComment(modalText, parentId);
  };

  // Build comment tree
  const topLevel = comments.filter(c => !c.parent_comment_id);
  const replies = comments.filter(c => c.parent_comment_id);
  const getReplies = (parentId) => replies.filter(r => r.parent_comment_id === parentId);

  return (
    <div className="reddit-detail-wrapper">
      <button className="reddit-back-btn" onClick={onBack}>← Back to Feed</button>

      <div className="reddit-detail-post">
        {/* Vote sidebar */}
        <div className="reddit-vote-sidebar">
          <button
            className={`reddit-vote-btn upvote ${article.isLiked ? 'active' : ''}`}
            onClick={() => onLike(article._id)}
          >
            ▲
          </button>
          <span className={`reddit-vote-count ${article.isLiked ? 'liked' : ''}`}>{article.likes}</span>
          <button className="reddit-vote-btn downvote" disabled>▼</button>
        </div>

        <div className="reddit-detail-body">
          {/* Meta */}
          <div className="reddit-post-meta">
            <span className="reddit-subreddit">📋 Doctor Articles</span>
            <span className="reddit-separator">•</span>
            <span className="reddit-posted-by">
              Posted by <span className="doctor-badge">Dr.</span> {article.author?.name}
            </span>
            {article.author?.specialization && (
              <span className="reddit-author-flair">{article.author.specialization}</span>
            )}
            <span className="reddit-separator">•</span>
            <span className="reddit-time">{timeAgo(article.publishedAt || article.createdAt)}</span>
          </div>

          <h1 className="reddit-detail-title">{article.title}</h1>

          {article.tags && article.tags.length > 0 && (
            <div className="reddit-post-tags">
              {article.tags.map((tag, i) => (
                <span key={i} className="reddit-tag">{tag}</span>
              ))}
            </div>
          )}

          {article.featuredImage && (
            <div className="reddit-detail-image">
              <img src={article.featuredImage} alt={article.title} />
            </div>
          )}

          <div className="reddit-detail-content" dangerouslySetInnerHTML={{ __html: article.content }} />

          {/* Action bar */}
          <div className="reddit-action-bar">
            <span className="reddit-action-btn">Comments {comments.length}</span>
            <span className="reddit-action-btn">Views {article.views}</span>
            <button className="reddit-action-btn">Share</button>
            <button
              className={`reddit-action-btn ${article.isSaved ? 'saved' : ''}`}
              onClick={() => onSave(article._id)}
            >
              {article.isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Comment section */}
      <div className="reddit-comments-section">
        <div className="comment-cta">
          <div className="comment-cta-text">
            Comment as <strong>{(() => { try { return JSON.parse(localStorage.getItem('user'))?.full_name || 'User'; } catch { return 'User'; } })()}</strong>
          </div>
          <button className="comment-cta-button" onClick={() => openModal('comment')}>Add Comment</button>
        </div>

        <div className="reddit-comments-list">
          {topLevel.map(comment => (
            <div key={comment._id} className="reddit-comment">
              <div className="reddit-comment-thread-line"></div>
              <div className="reddit-comment-content">
                <div className="reddit-comment-meta">
                  {comment.author_role === 'doctor' && <span className="doctor-badge">Dr.</span>}
                  <span className="reddit-comment-author">{comment.authorName}</span>
                  <span className="reddit-separator">•</span>
                  <span className="reddit-comment-time">{timeAgo(comment.created_at)}</span>
                </div>
                <p className="reddit-comment-text">{comment.text}</p>
                <div className="reddit-comment-actions">
                  <button className="reddit-comment-action" onClick={() => openModal('reply', comment)}>
                    Reply
                  </button>
                  {canModifyComment(comment) && (
                    <>
                      <button className="reddit-comment-action" onClick={() => openModal('edit', comment)}>
                        Edit
                      </button>
                      <button
                        className="reddit-comment-action danger"
                        onClick={() => {
                          if (window.confirm('Delete this comment?')) {
                            deleteComment(comment._id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>

                {/* Replies */}
                {getReplies(comment._id).map(reply => (
                  <div key={reply._id} className="reddit-comment reddit-comment-nested">
                    <div className="reddit-comment-thread-line"></div>
                    <div className="reddit-comment-content">
                      <div className="reddit-comment-meta">
                        {reply.author_role === 'doctor' && <span className="doctor-badge">Dr.</span>}
                        <span className="reddit-comment-author">{reply.authorName}</span>
                        <span className="reddit-separator">•</span>
                        <span className="reddit-comment-time">{timeAgo(reply.created_at)}</span>
                      </div>
                      <p className="reddit-comment-text">{reply.text}</p>
                      <div className="reddit-comment-actions">
                        <button className="reddit-comment-action" onClick={() => openModal('reply', reply)}>
                          Reply
                        </button>
                        {canModifyComment(reply) && (
                          <>
                            <button className="reddit-comment-action" onClick={() => openModal('edit', reply)}>
                              Edit
                            </button>
                            <button
                              className="reddit-comment-action danger"
                              onClick={() => {
                                if (window.confirm('Delete this comment?')) {
                                  deleteComment(reply._id);
                                }
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {topLevel.length === 0 && (
            <div className="reddit-no-comments">No comments yet. Be the first to share your thoughts!</div>
          )}
        </div>
      </div>
      {isModalOpen && (
        <div className="comment-modal-overlay" onClick={closeModal}>
          <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="comment-modal-header">
              <h4>
                {modalMode === 'edit'
                  ? 'Edit Comment'
                  : modalMode === 'reply'
                    ? 'Reply'
                    : 'Add Comment'}
              </h4>
              <button className="comment-modal-close" onClick={closeModal}>Close</button>
            </div>
            {modalMode === 'reply' && modalTarget && (
              <div className="comment-modal-context">
                Replying to {modalTarget.authorName || 'User'}
              </div>
            )}
            <textarea
              className="comment-modal-input"
              rows="5"
              placeholder="Write your comment..."
              value={modalText}
              onChange={(e) => setModalText(e.target.value)}
            />
            <div className="comment-modal-actions">
              <button className="comment-modal-cancel" onClick={closeModal}>Cancel</button>
              <button className="comment-modal-submit" onClick={submitModal}>
                {modalMode === 'edit'
                  ? 'Save'
                  : modalMode === 'reply'
                    ? 'Reply'
                    : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const PostDetail = ({ post, onBack, onLike, onCommentAdded, timeAgo, token, headers }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const API = 'http://localhost:5000/api/posts';
  const currentUserName = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'))?.full_name || 'User';
    } catch {
      return 'User';
    }
  })();

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API}/${post._id}/comments`);
      const data = await res.json();
      if (data.success) setComments(data.data || []);
    } catch (err) {
      console.error('Error fetching post comments:', err);
    }
  };

  useEffect(() => { fetchComments(); }, [post._id]);

  const submitComment = async () => {
    if (!token) return alert('Please log in to comment.');
    if (!commentText.trim()) return;
    setCommentSubmitting(true);
    try {
      const res = await fetch(`${API}/${post._id}/comments`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText })
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => [...prev, data.data]);
        setCommentText('');
        if (onCommentAdded) onCommentAdded(post._id);
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    }
    setCommentSubmitting(false);
  };

  const authorLabel = post.is_anonymous
    ? 'Anonymous'
    : (post.author?.name || 'Community Member');

  return (
    <div className="post-detail-wrapper">
      <button className="reddit-back-btn" onClick={onBack}>Back to Posts</button>

      <div className="reddit-detail-post post-detail-card">
        <div className="reddit-vote-sidebar">
          <button
            className={`reddit-vote-btn upvote ${post.isLiked ? 'active' : ''}`}
            onClick={() => onLike(post._id)}
          >
            Like
          </button>
          <span className={`reddit-vote-count ${post.isLiked ? 'liked' : ''}`}>{post.like_count || 0}</span>
        </div>

        <div className="reddit-detail-body">
          <div className="reddit-post-meta">
            <span className="reddit-subreddit">Community Posts</span>
            <span className="reddit-separator">-</span>
            <span className="reddit-posted-by">
              Posted by {post.author_type === 'doctor' && !post.is_anonymous ? 'Dr. ' : ''}{authorLabel}
            </span>
            <span className="reddit-separator">-</span>
            <span className="reddit-time">{timeAgo(post.created_at)}</span>
          </div>

          <h1 className="reddit-detail-title">{post.title}</h1>

          {post.tags && post.tags.length > 0 && (
            <div className="reddit-post-tags">
              {post.tags.map((tag, i) => (
                <span key={i} className="reddit-tag">{tag}</span>
              ))}
            </div>
          )}

          {post.media_url && post.media_type === 'image' && (
            <div className="reddit-detail-image">
              <img src={post.media_url} alt={post.title} />
            </div>
          )}

          <div className="reddit-detail-content">
            <p className="post-detail-text">{post.content}</p>
          </div>

          <div className="reddit-action-bar">
            <span className="reddit-action-btn">Comments {comments.length}</span>
            <span className="reddit-action-btn">Views {post.view_count || 0}</span>
            <button className="reddit-action-btn">Share</button>
          </div>
        </div>
      </div>

      <div className="reddit-comments-section">
        <div className="comment-cta">
          <div className="comment-cta-text">
            Comment as <strong>{currentUserName}</strong>
          </div>
        </div>
        <div className="post-comment-box">
          <textarea
            className="comment-modal-input"
            rows="4"
            placeholder="Write your comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <div className="post-comment-actions">
            <button
              className="comment-modal-submit"
              type="button"
              onClick={submitComment}
              disabled={commentSubmitting || !commentText.trim()}
            >
              {commentSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>

        <div className="reddit-comments-list">
          {comments.length === 0 ? (
            <div className="reddit-no-comments">No comments yet. Be the first to share your thoughts!</div>
          ) : (
            comments.map(comment => (
              <div key={comment._id || comment.comment_id} className="reddit-comment">
                <div className="reddit-comment-thread-line"></div>
                <div className="reddit-comment-content">
                  <div className="reddit-comment-meta">
                    <span className="reddit-comment-author">{comment.authorName || 'Community Member'}</span>
                    <span className="reddit-separator">-</span>
                    <span className="reddit-comment-time">{timeAgo(comment.created_at)}</span>
                  </div>
                  <p className="reddit-comment-text">
                    {comment.text ?? comment.comment_text ?? ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const HealthInsightsTab = ({ cycleProfile, cycleTrackers }) => {
  return (
    <div className="health-insights-tab">
      <CycleHealthInsightsTab
        cycleProfile={cycleProfile}
        cycleTrackers={cycleTrackers}
      />
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
  const [activeSection, setActiveSection] = useState('posts');
  const [savedItems, setSavedItems] = useState([]);
  const [followedDoctors, setFollowedDoctors] = useState(() => {
    try {
      const raw = localStorage.getItem('followedDoctors');
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.map(item => (item || '').toString().trim().toLowerCase()).filter(Boolean);
    } catch {
      return [];
    }
  });

  const savedKey = 'savedArticles';
  const savedMetaKey = 'savedArticlesMeta';
  const followKey = 'followedDoctors';

  const handle = (() => {
    if (user?.email) return user.email.split('@')[0];
    if (user?.full_name) return user.full_name.split(' ')[0].toLowerCase();
    return 'member';
  })();

  const formatDoctorName = (key) => {
    if (!key) return 'Doctor';
    return key
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const formatSavedTime = (value) => {
    if (!value) return 'Recently';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  };

  const getSavedIds = () => {
    try {
      const raw = localStorage.getItem(savedKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getSavedMeta = () => {
    try {
      const raw = localStorage.getItem(savedMetaKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const refreshSavedItems = () => {
    const meta = getSavedMeta();
    if (meta.length) {
      setSavedItems(meta);
      return;
    }
    const ids = getSavedIds();
    if (ids.length) {
      setSavedItems(ids.map((id, index) => ({
        id,
        title: `Saved post ${index + 1}`,
        author: 'Doctor',
        time: 'Recently',
        tags: []
      })));
      return;
    }
    setSavedItems([]);
  };

  useEffect(() => {
    refreshSavedItems();
  }, []);

  const removeSaved = (id) => {
    const updatedIds = getSavedIds().filter(savedId => savedId !== id);
    localStorage.setItem(savedKey, JSON.stringify(updatedIds));
    const updatedMeta = getSavedMeta().filter(item => item && item.id !== id);
    localStorage.setItem(savedMetaKey, JSON.stringify(updatedMeta));
    setSavedItems(updatedMeta.length ? updatedMeta : updatedIds.map((savedId, index) => ({
      id: savedId,
      title: `Saved post ${index + 1}`,
      author: 'Doctor',
      time: 'Recently',
      tags: []
    })));
  };

  const toggleFollow = (key) => {
    const normalized = (key || '').toString().trim().toLowerCase();
    if (!normalized) return;
    const updated = followedDoctors.includes(normalized)
      ? followedDoctors.filter(name => name !== normalized)
      : [...followedDoctors, normalized];
    setFollowedDoctors(updated);
    localStorage.setItem(followKey, JSON.stringify(updated));
  };

  const posts = [];
  const comments = [];

  const stats = [
    { label: 'Posts', value: posts.length },
    { label: 'Comments', value: comments.length },
    { label: 'Saved', value: savedItems.length },
    { label: 'Following', value: followedDoctors.length }
  ];

  return (
    <div className="profile-social">
      <div className="profile-cover">
        <div className="profile-cover-glow"></div>
        <div className="profile-cover-content">
          <span className="profile-cover-pill">Community Member</span>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-xl">
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt={user.full_name} />
          ) : (
            <div className="profile-avatar-fallback">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        <div className="profile-card-info">
          <div className="profile-name-row">
            <h2>{user?.full_name || 'Community Member'}</h2>
            {user?.is_cycle_user && <span className="profile-pill">Cycle tracking active</span>}
          </div>
          <p className="profile-handle">@{handle}</p>
          <p className="profile-bio">
            Sharing lived experience, saving helpful doctor insights, and learning from the HerCycle community.
          </p>
          <div className="profile-meta">
            <span>{user?.email || 'member@hercycle'}</span>
            <span className="profile-meta-dot">&bull;</span>
            <span>{user?.contact_number || 'Contact not set'}</span>
          </div>
        </div>
        <div className="profile-card-actions">
          <button className="profile-action primary">Edit Profile</button>
          <button className="profile-action ghost">Share</button>
        </div>
      </div>

      <div className="profile-stats-row">
        {stats.map((stat) => (
          <div key={stat.label} className="profile-stat-card">
            <span className="profile-stat-value">{stat.value}</span>
            <span className="profile-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="profile-layout">
        <section className="profile-main">
          <div className="profile-tabs">
            {['posts', 'comments', 'saved', 'following'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`profile-tab-btn ${activeSection === tab ? 'active' : ''}`}
                onClick={() => setActiveSection(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="profile-tab-panel">
            {activeSection === 'posts' && (
              <div className="profile-empty">
                <h4>No posts yet</h4>
                <p>Start a conversation in the community feed to share your story.</p>
                <button className="profile-cta">Explore Community</button>
              </div>
            )}

            {activeSection === 'comments' && (
              <div className="profile-empty">
                <h4>No comments yet</h4>
                <p>Join a thread to ask questions or share insights.</p>
                <button className="profile-cta">Browse Articles</button>
              </div>
            )}

            {activeSection === 'saved' && (
              <div className="profile-list">
                {savedItems.length === 0 ? (
                  <div className="profile-empty">
                    <h4>No saved posts</h4>
                    <p>Save doctor articles to revisit them later.</p>
                    <button className="profile-cta">Find Articles</button>
                  </div>
                ) : (
                  savedItems.map((item) => (
                    <div key={item.id} className="profile-list-item">
                      <div className="profile-list-info">
                        <span className="profile-list-title">{item.title}</span>
                        <span className="profile-list-meta">
                          by {item.author || 'Doctor'} • {formatSavedTime(item.time)}
                        </span>
                        {item.tags && item.tags.length > 0 && (
                          <div className="profile-list-tags">
                            {item.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="profile-tag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button className="profile-list-action" onClick={() => removeSaved(item.id)}>
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeSection === 'following' && (
              <div className="profile-list">
                {followedDoctors.length === 0 ? (
                  <div className="profile-empty">
                    <h4>No followed doctors</h4>
                    <p>Follow doctors to keep their latest guidance in your feed.</p>
                    <button className="profile-cta">Discover Doctors</button>
                  </div>
                ) : (
                  followedDoctors.map((doctorKey) => (
                    <div key={doctorKey} className="profile-list-item">
                      <div className="profile-avatar-mini">
                        {formatDoctorName(doctorKey).charAt(0)}
                      </div>
                      <div className="profile-list-info">
                        <span className="profile-list-title">Dr. {formatDoctorName(doctorKey)}</span>
                        <span className="profile-list-meta">Gynecology</span>
                      </div>
                      <button
                        className="profile-list-action secondary"
                        onClick={() => toggleFollow(doctorKey)}
                      >
                        Following
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="profile-side">
          <div className="profile-side-card">
            <h4>About</h4>
            <div className="profile-about">
              <div className="profile-about-row">
                <span>NIC</span>
                <span>{user?.NIC || 'Not set'}</span>
              </div>
              <div className="profile-about-row">
                <span>Gender</span>
                <span>{user?.gender || 'Not set'}</span>
              </div>
              <div className="profile-about-row">
                <span>Date of Birth</span>
                <span>{user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div className="profile-about-row">
                <span>Contact</span>
                <span>{user?.contact_number || 'Not set'}</span>
              </div>
            </div>
          </div>
          <div className="profile-side-card highlight">
            <h4>Wellness Goals</h4>
            <p>Keep track of your cycle patterns, save insights, and follow verified doctors for guidance.</p>
          </div>
        </aside>
      </div>
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
