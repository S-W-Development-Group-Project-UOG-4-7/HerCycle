// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

// Import chart components (you'll need to install chart.js)
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [staffInfo, setStaffInfo] = useState(null);
    
    // Sample data for charts
    const fundraiserData = [
        { name: 'Jan', amount: 4000 },
        { name: 'Feb', amount: 3000 },
        { name: 'Mar', amount: 5000 },
        { name: 'Apr', amount: 2780 },
        { name: 'May', amount: 1890 },
        { name: 'Jun', amount: 2390 },
    ];
    
    const donationData = [
        { name: 'Small', value: 400, color: '#0088FE' },
        { name: 'Medium', value: 300, color: '#00C49F' },
        { name: 'Large', value: 300, color: '#FFBB28' },
        { name: 'Corporate', value: 200, color: '#FF8042' },
    ];
    
    const recentDonations = [
        { id: 1, donor: 'John Doe', amount: 100, date: '2024-01-15', fundraiser: 'Education Fund' },
        { id: 2, donor: 'Jane Smith', amount: 250, date: '2024-01-14', fundraiser: 'Medical Aid' },
        { id: 3, donor: 'Robert Johnson', amount: 50, date: '2024-01-13', fundraiser: 'Community Support' },
        { id: 4, donor: 'Sarah Williams', amount: 500, date: '2024-01-12', fundraiser: 'Education Fund' },
    ];
    
    const stats = {
        totalFundraisers: 12,
        activeFundraisers: 8,
        totalDonations: 45000,
        monthlyDonations: 12500,
        totalDonors: 345,
        newsletterSubscribers: 1200,
    };

    useEffect(() => {
        // Check if staff is logged in
        const isStaffLoggedIn = localStorage.getItem('staffLoggedIn');
        const staffName = localStorage.getItem('staffName');
        const staffRole = localStorage.getItem('staffRole');
        
        if (!isStaffLoggedIn || isStaffLoggedIn !== 'true') {
            navigate('/staff-login');
            return;
        }
        
        setStaffInfo({
            name: staffName || 'Staff Member',
            role: staffRole || 'staff',
            email: localStorage.getItem('staffEmail') || ''
        });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('staffLoggedIn');
        localStorage.removeItem('staffName');
        localStorage.removeItem('staffRole');
        localStorage.removeItem('staffEmail');
        navigate('/staff-login');
    };

    const renderDashboard = () => (
        <div className="dashboard-content">
            <h2 className="page-title">Dashboard Overview</h2>
            <p className="page-subtitle">Welcome back, {staffInfo?.name}!</p>
            
            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <h3>${stats.totalDonations.toLocaleString()}</h3>
                        <p>Total Donations</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-info">
                        <h3>${stats.monthlyDonations.toLocaleString()}</h3>
                        <p>Monthly Donations</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>{stats.totalDonors}</h3>
                        <p>Total Donors</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">📧</div>
                    <div className="stat-info">
                        <h3>{stats.newsletterSubscribers}</h3>
                        <p>Newsletter Subs</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-info">
                        <h3>{stats.totalFundraisers}</h3>
                        <p>Total Fundraisers</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-info">
                        <h3>{stats.activeFundraisers}</h3>
                        <p>Active Fundraisers</p>
                    </div>
                </div>
            </div>
            
            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-container">
                    <h3>Monthly Donations</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={fundraiserData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="amount" fill="#8884d8" name="Donation Amount ($)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="chart-container">
                    <h3>Donation Types</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={donationData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.name}: ${entry.value}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {donationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            {/* Recent Donations Table */}
            <div className="recent-table">
                <h3>Recent Donations</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Donor</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Fundraiser</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentDonations.map(donation => (
                            <tr key={donation.id}>
                                <td>{donation.donor}</td>
                                <td>${donation.amount}</td>
                                <td>{donation.date}</td>
                                <td>{donation.fundraiser}</td>
                                <td>
                                    <button className="action-btn view">View</button>
                                    <button className="action-btn edit">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderFundraiserManagement = () => (
        <div className="management-content">
            <h2 className="page-title">Fundraiser Management</h2>
            <div className="action-bar">
                <button className="btn-primary">+ Create New Fundraiser</button>
                <input type="text" placeholder="Search fundraisers..." className="search-input" />
            </div>
            {/* Fundraiser list would go here */}
        </div>
    );

    const renderContent = () => {
        switch(activeMenu) {
            case 'dashboard': return renderDashboard();
            case 'fundraiser': return renderFundraiserManagement();
            case 'donation': return <div>Donation Management Content</div>;
            case 'newsletter': return <div>Newsletter Management Content</div>;
            case 'reports': return <div>Reports Content</div>;
            case 'faq': return <div>FAQ Management Content</div>;
            case 'notifications': return <div>Notifications Content</div>;
            default: return renderDashboard();
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>HerCycle CMS</h2>
                    <p>Admin Panel</p>
                </div>
                
                <div className="user-info">
                    <div className="user-avatar">
                        {staffInfo?.name?.charAt(0) || 'S'}
                    </div>
                    <div className="user-details">
                        <strong>{staffInfo?.name}</strong>
                        <small>{staffInfo?.role}</small>
                    </div>
                </div>
                
                <nav className="sidebar-nav">
                    <button 
                        className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('dashboard')}
                    >
                        📊 Dashboard
                    </button>
                    
                    <button 
                        className={`nav-item ${activeMenu === 'fundraiser' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('fundraiser')}
                    >
                        💰 Fundraiser Management
                    </button>
                    
                    <button 
                        className={`nav-item ${activeMenu === 'donation' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('donation')}
                    >
                        🎁 Donation Management
                    </button>
                    
                    <button 
                        className={`nav-item ${activeMenu === 'newsletter' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('newsletter')}
                    >
                        📧 Newsletter Management
                    </button>
                    
                    <button 
                        className={`nav-item ${activeMenu === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('reports')}
                    >
                        📈 Reports
                    </button>
                    
                    <button 
                        className={`nav-item ${activeMenu === 'faq' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('faq')}
                    >
                        ❓ FAQ Management
                    </button>
                    
                    <button 
                        className={`nav-item ${activeMenu === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('notifications')}
                    >
                        🔔 Notifications
                    </button>
                    
                    <div className="nav-divider"></div>
                    
                    <button 
                        className="nav-item logout"
                        onClick={handleLogout}
                    >
                        🚪 Logout
                    </button>
                </nav>
            </div>
            
            {/* Main Content */}
            <div className="main-content">
                <header className="main-header">
                    <div className="header-left">
                        <h1>{activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}</h1>
                    </div>
                    <div className="header-right">
                        <button className="notification-btn">🔔 <span className="badge">3</span></button>
                        <div className="user-menu">
                            <span>Welcome, {staffInfo?.name}</span>
                        </div>
                    </div>
                </header>
                
                <div className="content-area">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;