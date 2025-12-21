// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Profile.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [cycleData, setCycleData] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const navigate = useNavigate();

  // Mock user data (in real app, fetch from API)
  const mockUserData = {
    username: "jane_doe",
    name: "Jane Doe",
    email: "jane.doe@example.com",
    age: 24,
    height: "165 cm",
    weight: "58 kg",
    school: "University of Health Sciences",
    grade: "Graduate Student",
    gender: "Female",
    birthday: "1999-05-15",
    lastPeriod: "2024-02-01",
    cycleLength: 28,
    periodLength: 5,
    avgCycle: 28,
    fertilityWindow: "Feb 12-16, 2024",
    nextPeriod: "Feb 29, 2024"
  };

  // Mock cycle data
  const mockCycleData = {
    currentDay: 18,
    phase: "Luteal Phase",
    daysLeft: 10,
    nextPhase: "Period starts in 10 days",
    ovulationDate: "Feb 14, 2024",
    pregnancyChance: "Low",
    mood: "Stable",
    energy: "Moderate"
  };

  // Mock symptoms
  const mockSymptoms = [
    { id: 1, name: "Cramps", active: true, icon: "💢" },
    { id: 2, name: "Fatigue", active: true, icon: "😴" },
    { id: 3, name: "Headache", active: false, icon: "🤕" },
    { id: 4, name: "Bloating", active: true, icon: "🎈" },
    { id: 5, name: "Mood Swings", active: true, icon: "🎭" },
    { id: 6, name: "Breast Tenderness", active: false, icon: "👙" },
    { id: 7, name: "Acne", active: false, icon: "🔴" },
    { id: 8, name: "Food Cravings", active: true, icon: "🍫" }
  ];

  // Mock health stats
  const healthStats = [
    { id: 1, label: "Cycle Regularity", value: "Regular", icon: "📈", color: "#10b981" },
    { id: 2, label: "Stress Level", value: "Medium", icon: "🧘", color: "#f59e0b" },
    { id: 3, label: "Sleep Quality", value: "7.5/10", icon: "😴", color: "#3b82f6" },
    { id: 4, label: "Water Intake", value: "2.1L", icon: "💧", color: "#06b6d4" }
  ];

  // Mock calendar data
  const generateCalendar = () => {
    const days = [];
    const today = new Date().getDate();
    const periodStart = 1; // Mock period start day
    const periodEnd = 5; // Mock period end day
    const fertileStart = 12;
    const fertileEnd = 16;

    for (let i = 1; i <= 31; i++) {
      let className = "day";
      if (i >= periodStart && i <= periodEnd) {
        className += " period";
      } else if (i >= fertileStart && i <= fertileEnd) {
        className += " fertile";
      } else if (i > today && i <= today + 7) {
        className += " upcoming";
      }
      days.push({ day: i, className });
    }
    return days;
  };

  useEffect(() => {
    // Check if user is logged in
    const userData = sessionStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    // In real app, fetch user data from API
    setUser(mockUserData);
    setCycleData(mockCycleData);
    setSymptoms(mockSymptoms);
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    localStorage.removeItem('rememberedUser');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem',
          color: '#7c3aed'
        }}>
          <h1>Loading your dashboard...</h1>
          <p>Please wait while we load your information</p>
        </div>
      </div>
    );
  }

  const calendarDays = generateCalendar();

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <div className="profile-logo">
          <span>🌸</span>
          HerCycle Dashboard
        </div>
        <nav className="profile-nav">
          <a href="/" className="nav-link-profile">🏠 Home</a>
          <a href="/profile" className="nav-link-profile active">👤 Profile</a>
          <a href="/tracker" className="nav-link-profile">📅 Tracker</a>
          <a href="/insights" className="nav-link-profile">📊 Insights</a>
          <a href="/education" className="nav-link-profile">📚 Education</a>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </nav>
      </header>

      <main className="profile-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h1>Welcome back, {user.name}! 🌸</h1>
          <p>
            Here's your personalized health dashboard. Track your cycle, monitor symptoms, 
            and stay informed about your menstrual health journey.
          </p>
        </section>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* User Information Card */}
          <div className="user-info-card">
            <div className="card-header">
              <span className="card-icon">👤</span>
              <h2>Personal Information</h2>
            </div>
            <div className="user-details-grid">
              <div className="detail-item">
                <span className="detail-label">Username</span>
                <span className="detail-value">@{user.username}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Age</span>
                <span className="detail-value">{user.age} years</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Height</span>
                <span className="detail-value">{user.height}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Weight</span>
                <span className="detail-value">{user.weight}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Gender</span>
                <span className="detail-value">{user.gender}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Birthday</span>
                <span className="detail-value">{user.birthday}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">School</span>
                <span className="detail-value">{user.school}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Grade/Year</span>
                <span className="detail-value">{user.grade}</span>
              </div>
            </div>
          </div>

          {/* Cycle Tracking Card */}
          <div className="cycle-card">
            <div className="card-header">
              <span className="card-icon">📅</span>
              <h2>Current Cycle Status</h2>
            </div>
            
            {cycleData && (
              <div className="cycle-info">
                <div className={`cycle-phase ${cycleData.phase === 'Luteal Phase' ? 'active' : ''}`}>
                  <h3>Current Phase</h3>
                  <p>{cycleData.phase}</p>
                  <span className="phase-label">Day {cycleData.currentDay}</span>
                </div>
                
                <div className="cycle-phase">
                  <h3>Days Left</h3>
                  <p>{cycleData.daysLeft}</p>
                  <span className="phase-label">{cycleData.nextPhase}</span>
                </div>
              </div>
            )}

            <div className="cycle-calendar">
              <div className="calendar-header">
                <h3>February 2024</h3>
                <span>Today: Day {cycleData?.currentDay}</span>
              </div>
              <div className="calendar-days">
                {calendarDays.map((day, index) => (
                  <div key={index} className={day.className}>
                    {day.day}
                  </div>
                ))}
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginTop: '1rem',
                fontSize: '0.8rem',
                justifyContent: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, #ec4899, #f472b6)', borderRadius: '3px' }}></div>
                  <span>Period</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, #a855f7, #c084fc)', borderRadius: '3px' }}></div>
                  <span>Fertile</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: '3px' }}></div>
                  <span>Upcoming</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Stats */}
        <div className="user-info-card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <span className="card-icon">📊</span>
            <h2>Health Statistics</h2>
          </div>
          <div className="health-stats-grid">
            {healthStats.map((stat) => (
              <div key={stat.id} className="stat-box">
                <span className="stat-icon">{stat.icon}</span>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Symptoms Section */}
        <div className="symptoms-section">
          <div className="card-header">
            <span className="card-icon">💭</span>
            <h2>Today's Symptoms</h2>
          </div>
          <div className="symptoms-grid">
            {symptoms.map((symptom) => (
              <div key={symptom.id} className={`symptom-item ${symptom.active ? 'active' : ''}`}>
                <span className="symptom-icon">{symptom.icon}</span>
                <div>
                  <div style={{ fontWeight: '600', color: '#374151' }}>{symptom.name}</div>
                  <div style={{ fontSize: '0.8rem', color: symptom.active ? '#ec4899' : '#9ca3af' }}>
                    {symptom.active ? 'Active' : 'Not Active'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <a href="/tracker" className="action-btn">
            <span>📝</span>
            Log Today's Symptoms
          </a>
          <a href="/predictions" className="action-btn secondary">
            <span>🔮</span>
            View Predictions
          </a>
          <a href="/reports" className="action-btn secondary">
            <span>📄</span>
            Generate Report
          </a>
          <a href="/settings" className="action-btn secondary">
            <span>⚙️</span>
            Settings
          </a>
        </div>
      </main>
    </div>
  );
}