// OverviewDashboard.jsx - Enhanced Overview with Phase 7 Widgets
import React from 'react';
import HealthStatusWidget from '../components/HealthStatusWidget';
import ActivityFeedWidget from '../components/ActivityFeedWidget';
import TopTopicsWidget from '../components/TopTopicsWidget';
import StatsWidget from '../components/StatsWidget';
import '../components/Widgets.css';

const OverviewDashboard = () => {
    return (
        <div>
            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title">
                        <span className="section-icon">📊</span>
                        System Overview
                    </h2>
                </div>

                <div className="stats-grid">
                    {/* Health Status Widget */}
                    <HealthStatusWidget />

                    {/* Total Warnings Widget */}
                    <StatsWidget
                        endpoint="/api/admin/stats/warnings-total"
                        title="Total Warnings"
                        icon="⚠️"
                        color="orange"
                        renderValue={(data) => (
                            <>
                                <div className="stat-value">{data?.total || 0}</div>
                                <div className="stat-label">Total Warnings</div>
                                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: 'rgba(255,255,255,0.8)' }}>
                                    {data?.last_30_days || 0} in last 30 days
                                </div>
                            </>
                        )}
                    />

                    {/* Cycle Users Widget */}
                    <StatsWidget
                        endpoint="/api/admin/stats/cycle-users"
                        title="Cycle Tracking Users"
                        icon="🔄"
                        color="purple"
                        renderValue={(data) => (
                            <>
                                <div className="stat-value">{data?.percentage || 0}%</div>
                                <div className="stat-label">Cycle Tracking Users</div>
                                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: 'rgba(255,255,255,0.8)' }}>
                                    {data?.cycle_users || 0} of {data?.total_users || 0} users
                                </div>
                            </>
                        )}
                    />

                    {/* Placeholder Stats */}
                    <div className="stat-card blue">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <div className="stat-value">Quick Stats</div>
                            <div className="stat-label">Available Above</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Widgets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                {/* Recent Activity Feed */}
                <ActivityFeedWidget />

                {/* Top Topics */}
                <TopTopicsWidget />
            </div>
        </div>
    );
};

export default OverviewDashboard;
