import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WebManagerDashboard.css';

const WebManagerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Landing Page State
  const [_landingPageData, setLandingPageData] = useState(null);
  const [landingPageForm, setLandingPageForm] = useState({});

  // Fundraising State
  const [_fundraisingData, setFundraisingData] = useState(null);
  const [fundraisingForm, setFundraisingForm] = useState({});

  // Donations & Analytics State
  const [donations, setDonations] = useState([]);
  const [campaignStats, setCampaignStats] = useState([]);
  const [totalRaised, setTotalRaised] = useState(0);
  const [totalDonors, setTotalDonors] = useState(0);

  // Campaigns State
  const [campaigns, setCampaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    goal: 0,
    category: 'Education',
    image: '🌸'
  });

  // Approval Workflows State
  // Pending campaigns tracked via campaigns state

  // Profile State
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    contact_number: '',
    gender: '',
    date_of_birth: ''
  });

  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState({
    totalPages: 1,
    totalCampaigns: 0,
    totalDonations: 0,
    totalFundsRaised: 0
  });

  // Initialize user and fetch data
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('authToken');

    if (!userData || !token) {
      navigate('/login');
      return;
    }

    if (userData.role !== 'web_manager') {
      navigate('/login');
      return;
    }

    setUser(userData);
    setProfileForm({
      full_name: userData.full_name,
      email: userData.email,
      contact_number: userData.contact_number,
      gender: userData.gender,
      date_of_birth: userData.date_of_birth
    });

    // Fetch all dashboard data
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch landing page
      const landingPageRes = await fetch('http://localhost:5000/api/landing-page/admin', {
        headers
      });
      if (landingPageRes.ok) {
        const landingData = await landingPageRes.json();
        setLandingPageData(landingData.data);
        setLandingPageForm(landingData.data);
      }

      // Fetch fundraising data
      const fundraisingRes = await fetch('http://localhost:5000/api/fundraising', {
        headers
      });
      if (fundraisingRes.ok) {
        const fundraisingDataRes = await fundraisingRes.json();
        setFundraisingData(fundraisingDataRes.data);
        setFundraisingForm(fundraisingDataRes.data);
        if (fundraisingDataRes.data.campaigns) {
          setCampaigns(fundraisingDataRes.data.campaigns);
        }
      }

      // Fetch donations
      const donationsRes = await fetch('http://localhost:5000/api/payment/donations', {
        headers
      });
      if (donationsRes.ok) {
        const donationsData = await donationsRes.json();
        setDonations(donationsData.data || []);

        // Calculate stats
        if (donationsData.data) {
          const total = donationsData.data.reduce((sum, d) => sum + (d.amount || 0), 0);
          setTotalRaised(total);
          setTotalDonors(donationsData.data.length);

          // Calculate campaign-wise stats
          const campStats = {};
          donationsData.data.forEach(donation => {
            if (donation.campaignName) {
              if (!campStats[donation.campaignName]) {
                campStats[donation.campaignName] = { total: 0, count: 0 };
              }
              campStats[donation.campaignName].total += donation.amount;
              campStats[donation.campaignName].count += 1;
            }
          });
          setCampaignStats(Object.entries(campStats).map(([name, data]) => ({
            name,
            total: data.total,
            donors: data.count
          })));
        }
      }

      // Update dashboard stats
      setDashboardStats({
        totalPages: 1,
        totalCampaigns: campaigns.length,
        totalDonations: donations.length,
        totalFundsRaised: totalRaised
      });

      setMessage({ type: 'success', text: 'Dashboard data loaded successfully' });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setMessage({ type: 'error', text: 'Failed to load dashboard data' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/user/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        // Update local user data
        const updatedUser = { ...user, ...profileForm };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCampaign = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // const token = localStorage.getItem('authToken');

      // Create campaign (will need API endpoint)
      const campaignData = {
        ...newCampaign,
        raised: 0,
        donors: 0,
        daysLeft: 30,
        active: false,
        status: 'pending' // For approval workflow
      };

      // For now, add to local state (backend would handle this)
      const updatedCampaigns = [...campaigns, campaignData];
      setCampaigns(updatedCampaigns);

      setNewCampaign({
        title: '',
        description: '',
        goal: 0,
        category: 'Education',
        image: '🌸'
      });

      setMessage({ type: 'success', text: 'Campaign created and sent for approval' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleLandingPageChange = (section, field, value) => {
    setLandingPageForm({
      ...landingPageForm,
      [section]: {
        ...landingPageForm[section],
        [field]: value
      }
    });
  };

  const handleSaveLandingPage = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/landing-page/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(landingPageForm)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Landing page updated successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update landing page' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFundraising = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/fundraising/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fundraisingForm)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Fundraising page updated successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update fundraising page' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="wm-dashboard-loading">
        <div className="wm-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="wm-dashboard-container">
      {/* Header */}
      <header className="wm-dashboard-header">
        <div className="wm-header-content">
          <h1>🌸 Web Manager Dashboard</h1>
          <div className="wm-header-user">
            <span>{user?.full_name}</span>
            <button className="wm-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Message Alert */}
      {message.text && (
        <div className={`wm-alert wm-alert-${message.type}`}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="wm-dashboard-nav">
        <button
          className={`wm-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`wm-nav-btn ${activeTab === 'landing' ? 'active' : ''}`}
          onClick={() => { setActiveTab('landing'); navigate('/admin'); }}
        >
          🏠 Landing Page
        </button>
        <button
          className={`wm-nav-btn ${activeTab === 'fundraising' ? 'active' : ''}`}
          onClick={() => { setActiveTab('fundraising'); navigate('/adminF'); }}
        >
          💰 Fundraising
        </button>
        <button
          className={`wm-nav-btn ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => { setActiveTab('community'); navigate('/community'); }}
        >
          🌐 Community
        </button>
        <button
          className={`wm-nav-btn ${activeTab === 'donations' ? 'active' : ''}`}
          onClick={() => { setActiveTab('donations'); navigate('/donation-overview'); }}
        >
          💳 Donations
        </button>
        <button
          className={`wm-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => { setActiveTab('profile'); navigate('/web-manager-profile'); }}
        >
          👤 Profile
        </button>
      </nav>

      {/* Content Area */}
      <main className="wm-dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <section className="wm-section">
            <h2>Dashboard Overview</h2>
            <div className="wm-stats-grid">
              <div className="wm-stat-card">
                <h3>📄 Landing Pages</h3>
                <p className="wm-stat-number">{dashboardStats.totalPages}</p>
                <p className="wm-stat-label">Managed</p>
              </div>
              <div className="wm-stat-card">
                <h3>🎯 Active Campaigns</h3>
                <p className="wm-stat-number">{campaigns.length}</p>
                <p className="wm-stat-label">Campaigns</p>
              </div>
              <div className="wm-stat-card">
                <h3>💳 Total Donations</h3>
                <p className="wm-stat-number">{totalDonors}</p>
                <p className="wm-stat-label">Donors</p>
              </div>
              <div className="wm-stat-card">
                <h3>💰 Funds Raised</h3>
                <p className="wm-stat-number">Rs.{totalRaised.toLocaleString()}</p>
                <p className="wm-stat-label">Total</p>
              </div>
            </div>

            <div className="wm-overview-section">
              <h3>Recent Campaign Performance</h3>
              {campaignStats.length > 0 ? (
                <div className="wm-campaign-stats">
                  {campaignStats.map((campaign, idx) => (
                    <div key={idx} className="wm-campaign-stat">
                      <h4>{campaign.name}</h4>
                      <p>Total: Rs.{campaign.total.toLocaleString()}</p>
                      <p>Donors: {campaign.donors}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="wm-no-data">No donation data yet</p>
              )}
            </div>
          </section>
        )}

        {/* Landing Page Management */}
        {activeTab === 'landing' && (
          <section className="wm-section">
            <h2>Landing Page Management</h2>
            {landingPageForm && landingPageForm.hero && (
              <div className="wm-form-section">
                <div className="wm-form-group">
                  <label>Hero Badge Text</label>
                  <input
                    type="text"
                    value={landingPageForm.hero.badgeText || ''}
                    onChange={(e) => handleLandingPageChange('hero', 'badgeText', e.target.value)}
                    className="wm-input"
                  />
                </div>

                <div className="wm-form-group">
                  <label>Main Heading</label>
                  <input
                    type="text"
                    value={landingPageForm.hero.mainHeading || ''}
                    onChange={(e) => handleLandingPageChange('hero', 'mainHeading', e.target.value)}
                    className="wm-input"
                  />
                </div>

                <div className="wm-form-group">
                  <label>Subheading</label>
                  <textarea
                    value={landingPageForm.hero.subheading || ''}
                    onChange={(e) => handleLandingPageChange('hero', 'subheading', e.target.value)}
                    className="wm-textarea"
                  />
                </div>

                {landingPageForm.about && (
                  <>
                    <hr className="wm-divider" />
                    <h3>About Section</h3>
                    <div className="wm-form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        value={landingPageForm.about.title || ''}
                        onChange={(e) => handleLandingPageChange('about', 'title', e.target.value)}
                        className="wm-input"
                      />
                    </div>

                    <div className="wm-form-group">
                      <label>Description 1</label>
                      <textarea
                        value={landingPageForm.about.description1 || ''}
                        onChange={(e) => handleLandingPageChange('about', 'description1', e.target.value)}
                        className="wm-textarea"
                      />
                    </div>

                    <div className="wm-form-group">
                      <label>Description 2</label>
                      <textarea
                        value={landingPageForm.about.description2 || ''}
                        onChange={(e) => handleLandingPageChange('about', 'description2', e.target.value)}
                        className="wm-textarea"
                      />
                    </div>
                  </>
                )}

                <button 
                  className="wm-btn wm-btn-primary" 
                  onClick={handleSaveLandingPage}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Landing Page'}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Fundraising Management */}
        {activeTab === 'fundraising' && (
          <section className="wm-section">
            <h2>Fundraising Page Management</h2>
            {fundraisingForm && fundraisingForm.hero && (
              <div className="wm-form-section">
                <div className="wm-form-group">
                  <label>Campaign Badge</label>
                  <input
                    type="text"
                    value={fundraisingForm.hero.badgeText || ''}
                    onChange={(e) => handleLandingPageChange('hero', 'badgeText', e.target.value)}
                    className="wm-input"
                  />
                </div>

                <div className="wm-form-group">
                  <label>Main Heading</label>
                  <input
                    type="text"
                    value={fundraisingForm.hero.mainHeading || ''}
                    onChange={(e) => handleLandingPageChange('hero', 'mainHeading', e.target.value)}
                    className="wm-input"
                  />
                </div>

                <button 
                  className="wm-btn wm-btn-primary" 
                  onClick={handleSaveFundraising}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Fundraising Page'}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <section className="wm-section">
            <h2>Create & Manage Campaigns</h2>
            
            <div className="wm-form-section">
              <h3>Create New Campaign (Pending Approval)</h3>
              <form onSubmit={handleAddCampaign}>
                <div className="wm-form-group">
                  <label>Campaign Title</label>
                  <input
                    type="text"
                    value={newCampaign.title}
                    onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                    className="wm-input"
                    required
                  />
                </div>

                <div className="wm-form-group">
                  <label>Description</label>
                  <textarea
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    className="wm-textarea"
                    required
                  />
                </div>

                <div className="wm-form-group">
                  <label>Goal Amount (Rs.)</label>
                  <input
                    type="number"
                    value={newCampaign.goal}
                    onChange={(e) => setNewCampaign({ ...newCampaign, goal: Number(e.target.value) })}
                    className="wm-input"
                    required
                  />
                </div>

                <div className="wm-form-group">
                  <label>Category</label>
                  <select
                    value={newCampaign.category}
                    onChange={(e) => setNewCampaign({ ...newCampaign, category: e.target.value })}
                    className="wm-input"
                  >
                    <option>Education</option>
                    <option>Healthcare</option>
                    <option>Emergency</option>
                    <option>Community</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="wm-btn wm-btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Creating...' : 'Create Campaign'}
                </button>
              </form>
            </div>

            <hr className="wm-divider" />

            <div className="wm-form-section">
              <h3>Active Campaigns ({campaigns.length})</h3>
              {campaigns.length > 0 ? (
                <div className="wm-campaigns-list">
                  {campaigns.map((campaign, idx) => (
                    <div key={idx} className="wm-campaign-item">
                      <div className="wm-campaign-header">
                        <h4>{campaign.image} {campaign.title}</h4>
                        <span className={`wm-status ${campaign.active ? 'active' : 'inactive'}`}>
                          {campaign.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p>{campaign.description}</p>
                      <div className="wm-campaign-stats-inline">
                        <span>Goal: Rs.{campaign.goal?.toLocaleString()}</span>
                        <span>Raised: Rs.{campaign.raised?.toLocaleString() || 0}</span>
                        <span>Donors: {campaign.donors || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="wm-no-data">No campaigns yet</p>
              )}
            </div>
          </section>
                  )}

                {/* Profile Management */}
        {activeTab === 'profile' && (
          <section className="wm-section">
            <h2>Edit Profile</h2>
            <div className="wm-profile-section">
              <form onSubmit={handleProfileUpdate}>
                <div className="wm-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="wm-input"
                  />
                </div>

                <div className="wm-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="wm-input"
                  />
                </div>

                <div className="wm-form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    value={profileForm.contact_number}
                    onChange={(e) => setProfileForm({ ...profileForm, contact_number: e.target.value })}
                    className="wm-input"
                  />
                </div>

                <div className="wm-form-group">
                  <label>Gender</label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    className="wm-input"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div className="wm-form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={profileForm.date_of_birth?.split('T')[0] || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                    className="wm-input"
                  />
                </div>

                <button 
                  type="submit" 
                  className="wm-btn wm-btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="wm-dashboard-footer">
        <p>&copy; 2026 HerCycle Web Manager. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WebManagerDashboard;
