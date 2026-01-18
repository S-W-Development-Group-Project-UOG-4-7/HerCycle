// DonationsAnalytics.jsx
import React, { useState, useEffect } from 'react';

const DonationsAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/admin/analytics/donations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setAnalytics(data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading analytics...</div>;

    return (
        <div>
            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title"><span className="section-icon"></span>Donations Analytics</h2>
                </div>
                <div className="stats-grid">
                    <div className="stat-card blue">
                        <div className="stat-value">${analytics?.total_amount?.toLocaleString() || 0}</div>
                        <div className="stat-label">Total Amount Raised</div>
                    </div>
                    <div className="stat-card purple">
                        <div className="stat-value">{analytics?.total_donations || 0}</div>
                        <div className="stat-label">Total Donations</div>
                    </div>
                </div>
            </div>
            <div className="section-card">
                <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Donations by Campaign</h3>
                <table className="data-table">
                    <thead>
                        <tr><th>Campaign</th><th>Total Amount</th><th>Donors</th></tr>
                    </thead>
                    <tbody>
                        {analytics?.donations_by_campaign?.map(campaign => (
                            <tr key={campaign.campaign_id}>
                                <td>{campaign.campaign_title || campaign.campaign_id}</td>
                                <td>${campaign.total_amount?.toLocaleString()}</td>
                                <td>{campaign.donor_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DonationsAnalytics;
