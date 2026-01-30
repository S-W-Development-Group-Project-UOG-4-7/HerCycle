// AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import GiveCredentials from './sections/GiveCredentials';
import AdminProfile from './sections/AdminProfile';
import DonationsAnalytics from './sections/DonationsAnalytics';
import UserAnalytics from './sections/UserAnalytics';
import PostCommentAnalytics from './sections/PostCommentAnalytics';
import WarningHistory from './sections/WarningHistory';
import PrivilegeControls from './sections/PrivilegeControls';
import DoctorVerification from './sections/DoctorVerification';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('credentials');
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAdminData = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:5000/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();
            if (result.success && result.data.role === 'admin') {
                setAdminData(result.data);
            } else {
                navigate('/login');
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loader"></div>
                <p>Loading Admin Dashboard...</p>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', icon: '👤', label: 'Admin Profile' },
        { id: 'credentials', icon: '🔑', label: 'Give Credentials' },
        { id: 'doctor-verification', icon: '🩺', label: 'Verify Doctors' },
        { id: 'donations', icon: '💰', label: 'Donations Analytics' },
        { id: 'community', icon: '👥', label: 'Community' },
        { id: 'users', icon: '📊', label: 'User Analytics' },
        { id: 'posts', icon: '📝', label: 'Posts/Comments' },
        { id: 'warnings', icon: '⚠️', label: 'Warning History' },
        { id: 'privileges', icon: '🛡️', label: 'Privilege Controls' },
    ];

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <header className="admin-header">
                <div className="admin-header-content">
                    <div className="admin-branding">
                        <h1><span className="brand-cycle">HerCycle Admin Dashboard</span></h1>
                        <p className="admin-subtitle">System Administration</p>
                    </div>
                    <div className="admin-user-info">
                        <div className="admin-avatar">
                            {adminData?.profile_picture ? (
                                <img
                                    src={`http://localhost:5000${adminData.profile_picture}`}
                                    alt="Admin"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <span style={{ display: adminData?.profile_picture ? 'none' : 'flex' }}>
                                {adminData?.full_name?.charAt(0) || 'A'}
                            </span>
                        </div>
                        <div className="admin-details">
                            <span className="admin-name">{adminData?.full_name}</span>
                            <span className="admin-role">Administrator</span>
                        </div>
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                </div>
            </header>

            <div className="admin-container">
                {/* Sidebar */}
                <aside className="admin-sidebar">
                    <nav className="admin-nav">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="tab-icon">{tab.icon}</span>
                                <span className="tab-label">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="admin-content">
                    {activeTab === 'credentials' && <GiveCredentials />}
                    {activeTab === 'profile' && <AdminProfile adminData={adminData} onUpdate={fetchAdminData} />}
                    {activeTab === 'doctor-verification' && <DoctorVerification />}

                    {activeTab === 'donations' && <DonationsAnalytics />}
                    {activeTab === 'community' && (
                        <div className="page-redirect">
                            <h2>Community Management</h2>
                            <p>View and moderate community posts, comments, and reports</p>
                            <button onClick={() => window.location.href = '/dashboard'} className="primary-btn">
                                Go to Community Dashboard
                            </button>
                        </div>
                    )}
                    {activeTab === 'users' && <UserAnalytics />}
                    {activeTab === 'posts' && <PostCommentAnalytics />}
                    {activeTab === 'warnings' && <WarningHistory />}
                    {activeTab === 'privileges' && <PrivilegeControls />}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
