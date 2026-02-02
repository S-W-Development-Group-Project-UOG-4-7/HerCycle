// DonationsAnalytics.jsx
import React, { useState, useEffect } from 'react';

const DonationsAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    // PHASE 5: Date range filters for PDF export
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [exporting, setExporting] = useState(false);

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

    // PHASE 5: Export donations to PDF
    const handleExportPDF = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');

            // Build query string with date filters
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`http://localhost:5000/api/admin/export-donations?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            // Download the PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `donations-report-${startDate || 'all'}-to-${endDate || 'now'}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert('✅ PDF report downloaded successfully!');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('❌ Failed to export PDF report');
        } finally {
            setExporting(false);
        }
    };

    if (loading) return <div>Loading analytics...</div>;

    return (
        <div>
            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title"><span className="section-icon"></span>Donations Analytics</h2>

                    {/* PHASE 5: PDF Export Controls */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.9rem', color: 'rgb(97, 28, 175)' }}>From:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="form-input"
                                style={{ width: '150px', padding: '0.5rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.9rem', color: 'rgb(97, 28, 175)' }}>To:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="form-input"
                                style={{ width: '150px', padding: '0.5rem' }}
                            />
                        </div>
                        <button
                            onClick={handleExportPDF}
                            disabled={exporting}
                            className="primary-btn"
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            {exporting ? '⏳ Generating...' : '📄 Download PDF Report'}
                        </button>
                    </div>
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
                <h3 style={{ marginBottom: '1rem', fontWeight: 600, color: 'rgb(97, 28, 175)' }}>Donations by Campaign</h3>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr><th>Campaign</th><th>Total Amount</th><th>Donors</th></tr>
                        </thead>
                        <tbody>
                            {analytics?.donations_by_campaign?.map(campaign => (
                                <tr key={campaign.campaign_id}>
                                    <td data-label="Campaign">{campaign.campaign_title || campaign.campaign_id}</td>
                                    <td data-label="Total">${campaign.total_amount?.toLocaleString()}</td>
                                    <td data-label="Donors">{campaign.donor_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DonationsAnalytics;
