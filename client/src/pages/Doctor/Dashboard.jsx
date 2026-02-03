import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const DoctorDashboard = ({ pending = false }) => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    
    setDoctor(userData);
    fetchDoctorVerification(userData.NIC);
    setLoading(false);
  }, [navigate]);

  const fetchDoctorVerification = async (nic) => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctor/verification/${nic}`);
      const data = await response.json();
      if (data.success) {
        setVerificationStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching verification:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Pending verification screen
  if (pending || (verificationStatus && verificationStatus.status !== 'approved')) {
    return (
      <div className="pending-verification">
        <div className="verification-card">
          <div className="verification-icon">⏳</div>
          <h2>Verification Pending</h2>
          <p>Your doctor account is under review. Our team will verify your credentials soon.</p>
          
          {verificationStatus ? (
            <div className="verification-details">
              <div className={`status-badge ${verificationStatus.status}`}>
                {verificationStatus.status.toUpperCase()}
              </div>
              <p>Submitted on: {new Date(verificationStatus.submitted_at).toLocaleDateString()}</p>
            </div>
          ) : (
            <div className="verification-actions">
              <button className="upload-btn">
                Upload License Documents
              </button>
              <button className="secondary-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>HerCycle</h2>
          <div className="user-greeting">
            <span className="welcome-text">Dr.</span>
            <span className="user-name">{doctor?.full_name}</span>
            <span className="user-role">
              <span className="verified-badge">✓ Verified Doctor</span>
              <span className="specialty">{doctor?.specialty}</span>
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Overview</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'consultations' ? 'active' : ''}`}
            onClick={() => setActiveTab('consultations')}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-text">Consultations</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'qna' ? 'active' : ''}`}
            onClick={() => setActiveTab('qna')}
          >
            <span className="nav-icon">❓</span>
            <span className="nav-text">Q&A Forum</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            <span className="nav-icon">📚</span>
            <span className="nav-text">Articles</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">My Patients</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Schedule</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-text">Profile</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="switch-dashboard-btn" onClick={() => navigate('/dashboard')}>
            <span>👥</span>
            <span>Switch to Community</span>
          </button>
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
            {activeTab === 'overview' && 'Doctor Dashboard'}
            {activeTab === 'consultations' && 'Consultations'}
            {activeTab === 'qna' && 'Q&A Forum'}
            {activeTab === 'articles' && 'Articles'}
            {activeTab === 'patients' && 'My Patients'}
            {activeTab === 'schedule' && 'Schedule'}
            {activeTab === 'profile' && 'My Profile'}
          </h1>
          
          <div className="header-actions">
            <div className="doctor-badges">
              <span className="badge verified">Verified ✓</span>
              <span className="badge online">Online</span>
            </div>
            <div className="user-avatar">
              <div className="avatar-placeholder">
                Dr. {doctor?.full_name?.split(' ')[0]?.charAt(0) || 'D'}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && <OverviewTab doctor={doctor} />}
          {activeTab === 'consultations' && <ConsultationsTab />}
          {activeTab === 'qna' && <QnATab />}
          {activeTab === 'articles' && <ArticlesTab />}
          {activeTab === 'patients' && <PatientsTab />}
          {activeTab === 'schedule' && <ScheduleTab />}
          {activeTab === 'profile' && <ProfileTab doctor={doctor} />}
        </div>
      </div>
    </div>
  );
};

// Doctor Dashboard Tab Components
const OverviewTab = ({ doctor }) => {
  const [stats, setStats] = useState({
    consultations: 24,
    patients: 156,
    articles: 8,
    answers: 42,
    rating: 4.8
  });

  return (
    <div className="doctor-overview">
      <div className="welcome-banner">
        <div className="welcome-content">
          <h2>Welcome back, Dr. {doctor?.full_name?.split(' ')[0]}</h2>
          <p>You have 3 pending consultations and 5 unanswered questions today.</p>
        </div>
        <div className="welcome-actions">
          <button className="primary-btn">Start Consultation</button>
          <button className="secondary-btn">View Schedule</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3>Consultations</h3>
            <p className="stat-value">{stats.consultations}</p>
            <span className="stat-change">+3 this week</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Patients</h3>
            <p className="stat-value">{stats.patients}</p>
            <span className="stat-change">+12 this month</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Articles</h3>
            <p className="stat-value">{stats.articles}</p>
            <span className="stat-change">Last: 2 weeks ago</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Rating</h3>
            <p className="stat-value">{stats.rating}/5.0</p>
            <span className="stat-change">Based on 128 reviews</span>
          </div>
        </div>
      </div>

      <div className="overview-sections">
        <div className="pending-consultations">
          <h3>Pending Consultations</h3>
          <div className="consultation-list">
            <div className="consultation-item">
              <div className="patient-info">
                <div className="patient-avatar">S</div>
                <div>
                  <span className="patient-name">Sarah Johnson</span>
                  <span className="consultation-time">2:00 PM Today</span>
                </div>
              </div>
              <button className="join-btn">Join Now</button>
            </div>
          </div>
        </div>

        <div className="recent-questions">
          <h3>Recent Questions</h3>
          <div className="question-list">
            <div className="question-item">
              <p className="question-text">"Is it normal to have irregular cycles after stopping birth control?"</p>
              <div className="question-meta">
                <span>Asked by: Maria L.</span>
                <span>2 hours ago</span>
              </div>
              <button className="answer-btn">Answer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConsultationsTab = () => {
  const [consultations, setConsultations] = useState([]);

  return (
    <div className="consultations-tab">
      <div className="tab-header">
        <h2>Consultations</h2>
        <div className="consultation-filters">
          <button className="filter-btn active">Upcoming</button>
          <button className="filter-btn">Completed</button>
          <button className="filter-btn">All</button>
        </div>
      </div>

      <div className="consultations-list">
        <div className="consultation-card">
          <div className="consultation-header">
            <div className="patient-info">
              <div className="patient-avatar">J</div>
              <div>
                <h4>Jennifer Smith</h4>
                <p>PCOS Management Consultation</p>
              </div>
            </div>
            <div className="consultation-status scheduled">
              Scheduled
            </div>
          </div>
          <div className="consultation-details">
            <div className="detail">
              <span className="detail-label">Date & Time</span>
              <span className="detail-value">Tomorrow, 10:30 AM</span>
            </div>
            <div className="detail">
              <span className="detail-label">Duration</span>
              <span className="detail-value">30 minutes</span>
            </div>
            <div className="detail">
              <span className="detail-label">Type</span>
              <span className="detail-value">Video Call</span>
            </div>
          </div>
          <div className="consultation-actions">
            <button className="primary-btn">Start Consultation</button>
            <button className="secondary-btn">Reschedule</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QnATab = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  return (
    <div className="qna-tab">
      <div className="qna-header">
        <h2>Community Questions</h2>
        <input 
          type="text" 
          placeholder="Search questions..." 
          className="search-input"
        />
      </div>

      <div className="qna-container">
        <div className="questions-list">
          <div className="question-card" onClick={() => setSelectedQuestion(1)}>
            <div className="question-content">
              <h4>How to manage severe period pain without medication?</h4>
              <p>I've been experiencing extremely painful periods and want to explore non-medical options...</p>
            </div>
            <div className="question-meta">
              <span>Asked by: Anonymous</span>
              <span>5 answers</span>
            </div>
          </div>
        </div>

        {selectedQuestion && (
          <div className="answer-section">
            <div className="question-detail">
              <h3>Selected Question</h3>
              <p>How to manage severe period pain without medication?</p>
              <textarea 
                placeholder="Write your professional answer..."
                rows="6"
              />
              <div className="answer-actions">
                <button className="primary-btn">Submit Answer</button>
                <button className="secondary-btn" onClick={() => setSelectedQuestion(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ArticlesTab = () => {
  const [articles, setArticles] = useState([]);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  return (
    <div className="articles-tab">
      <div className="articles-header">
        <h2>Medical Articles</h2>
        <button className="primary-btn">Create New Article</button>
      </div>

      <div className="create-article">
        <h3>Create Article</h3>
        <div className="article-form">
          <input 
            type="text" 
            placeholder="Article Title" 
            value={newArticle.title}
            onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
          />
          <select 
            value={newArticle.category}
            onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
          >
            <option value="general">General Health</option>
            <option value="pcos">PCOS</option>
            <option value="endometriosis">Endometriosis</option>
            <option value="menopause">Menopause</option>
            <option value="fertility">Fertility</option>
          </select>
          <textarea 
            placeholder="Write your article content here..."
            value={newArticle.content}
            onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
            rows="10"
          />
          <div className="article-actions">
            <button className="primary-btn">Publish</button>
            <button className="secondary-btn">Save Draft</button>
          </div>
        </div>
      </div>

      <div className="published-articles">
        <h3>Your Published Articles</h3>
        <div className="articles-list">
          <div className="article-card">
            <div className="article-header">
              <h4>Understanding PCOS: Symptoms and Management</h4>
              <span className="article-date">Published: Jan 15, 2024</span>
            </div>
            <p className="article-excerpt">Polycystic Ovary Syndrome affects 1 in 10 women of childbearing age. Here's what you need to know...</p>
            <div className="article-stats">
              <span>👁️ 1,245 views</span>
              <span>💬 42 comments</span>
              <span>❤️ 89 likes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientsTab = () => {
  const [patients, setPatients] = useState([]);

  return (
    <div className="patients-tab">
      <h2>My Patients</h2>
      
      <div className="patients-grid">
        <div className="patient-card">
          <div className="patient-header">
            <div className="patient-avatar">M</div>
            <div>
              <h4>Maria Garcia</h4>
              <p>Age: 28 | Last visit: 2 weeks ago</p>
            </div>
          </div>
          <div className="patient-details">
            <div className="detail">
              <span>Condition:</span>
              <span>PCOS</span>
            </div>
            <div className="detail">
              <span>Next Appointment:</span>
              <span>Feb 15, 2024</span>
            </div>
          </div>
          <button className="view-chart-btn">View Health Chart</button>
        </div>
      </div>
    </div>
  );
};

const ScheduleTab = () => {
  const [schedule, setSchedule] = useState([]);

  return (
    <div className="schedule-tab">
      <div className="schedule-header">
        <h2>Appointment Schedule</h2>
        <div className="schedule-actions">
          <button className="primary-btn">Add Availability</button>
          <button className="secondary-btn">Sync Calendar</button>
        </div>
      </div>

      <div className="calendar-view">
        <div className="calendar-header">
          <button>‹</button>
          <h3>January 2024</h3>
          <button>›</button>
        </div>
        <div className="calendar-grid">
          {/* Calendar days would go here */}
        </div>
      </div>

      <div className="appointments-list">
        <h3>Today's Appointments</h3>
        <div className="appointment-item">
          <div className="appointment-time">10:30 AM</div>
          <div className="appointment-details">
            <span className="patient-name">Sarah Johnson</span>
            <span className="appointment-type">Follow-up Consultation</span>
          </div>
          <button className="join-btn">Join</button>
        </div>
      </div>
    </div>
  );
};

const ProfileTab = ({ doctor }) => {
  return (
    <div className="doctor-profile-tab">
      <div className="profile-header">
        <div className="profile-avatar-large">
          <div className="doctor-avatar">
            Dr. {doctor?.full_name?.split(' ')[0]?.charAt(0) || 'D'}
          </div>
        </div>
        <div className="profile-info">
          <h2>Dr. {doctor?.full_name}</h2>
          <p className="specialty-display">{doctor?.specialty}</p>
          <div className="doctor-badges-large">
            <span className="badge verified">✓ Verified Doctor</span>
            <span className="badge experience">15 years experience</span>
          </div>
        </div>
      </div>

      <div className="profile-sections">
        <div className="professional-info">
          <h3>Professional Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Qualifications</span>
              <span className="info-value">{doctor?.qualifications || 'MD, Board Certified'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Hospital/Clinic</span>
              <span className="info-value">{doctor?.clinic_or_hospital || 'City General Hospital'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Experience</span>
              <span className="info-value">{doctor?.experience_years || '15'} years</span>
            </div>
            <div className="info-item">
              <span className="info-label">Consultation Hours</span>
              <span className="info-value">{doctor?.consultation_hours || 'Mon-Fri, 9AM-5PM'}</span>
            </div>
          </div>
        </div>

        <div className="bio-section">
          <h3>Bio</h3>
          <p className="bio-content">
            {doctor?.bio || 'Specialized in women\'s health with focus on reproductive endocrinology. Committed to providing compassionate care and evidence-based treatment.'}
          </p>
        </div>

        <div className="stats-section">
          <h3>Practice Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">156</span>
              <span className="stat-label">Patients</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">42</span>
              <span className="stat-label">Articles</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">4.8</span>
              <span className="stat-label">Rating</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Satisfaction</span>
            </div>
          </div>
        </div>

        <div className="verification-section">
          <h3>Verification Status</h3>
          <div className="verification-status approved">
            <span className="status-icon">✓</span>
            <span className="status-text">Verified Account</span>
            <span className="status-date">Verified on: Jan 10, 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;