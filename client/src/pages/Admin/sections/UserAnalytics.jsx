// UserAnalytics.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import ChartWrapper from '../components/ChartWrapper';

const UserAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [growthData, setGrowthData] = useState([]);
    const [growthLoading, setGrowthLoading] = useState(false); // Changed initial state to false
    const [dateRange, setDateRange] = useState('30');

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/admin/analytics/users', {
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

    const fetchGrowthData = useCallback(async () => {
        try {
            setGrowthLoading(true);
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5000/api/admin/analytics/user-growth?days=${dateRange}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setGrowthData(data.data.growth || []);
            }
        } catch (error) {
            console.error('Error fetching growth data:', error);
        } finally {
            setGrowthLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchAnalytics();
        fetchGrowthData();

        // Auto-refresh every 60 seconds
        const refreshInterval = setInterval(() => {
            fetchAnalytics();
            fetchGrowthData();
        }, 60000);

        return () => clearInterval(refreshInterval);
    }, [fetchGrowthData]);

    if (loading) return <div>Loading analytics...</div>;

    return (
        <div>
            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title"><span className="section-icon"></span>User Analytics</h2>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <div style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {analytics?.total_users || 0}
                        </div>
                        <div style={{ opacity: 0.9, marginBottom: '0.25rem' }}>Total Users</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>👥 Active accounts</div>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <div style={{ fontSize: ' 2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {analytics?.active_users || 0}
                        </div>
                        <div style={{ opacity: 0.9, marginBottom: '0.25rem' }}>Active Users</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>✅ Recently active</div>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {analytics?.cycle_users || 0}
                        </div>
                        <div style={{ opacity: 0.9, marginBottom: '0.25rem' }}>Cycle Tracking</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>📅 Using cycle features</div>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {analytics?.verified_doctors || 0}
                        </div>
                        <div style={{ opacity: 0.9, marginBottom: '0.25rem' }}>Doctors</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>👨‍⚕️ Medical professionals</div>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {analytics?.new_users_this_month || 0}
                        </div>
                        <div style={{ opacity: 0.9, marginBottom: '0.25rem' }}>New Users This Month</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>📈 Monthly growth</div>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {(analytics?.total_users || 0) > 0 ? Math.round(((analytics?.active_users || 0) / (analytics?.total_users || 1)) * 100) : 0}%
                        </div>
                        <div style={{ opacity: 0.9, marginBottom: '0.25rem' }}>Activity Rate</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>⚡ Engagement metric</div>
                    </div>
                </div>
            </div>

            {/* User Growth Chart */}
            <ChartWrapper
                title="User Growth Over Time"
                loading={growthLoading}
                height={350}
            >
                <div style={{ width: '100%', marginBottom: '1rem' }}>
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                        flexWrap: 'wrap'
                    }}>
                        {['7', '30', '90', 'all'].map(range => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={dateRange === range ? 'primary-btn' : 'secondary-btn'}
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.875rem',
                                    minWidth: '80px'
                                }}
                            >
                                {range === 'all' ? 'All Time' : `${range} Days`}
                            </button>
                        ))}
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={growthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                            <XAxis
                                dataKey="date"
                                stroke="rgba(97, 28, 175, 0.8)"
                                style={{ fontSize: '0.75rem', fontWeight: 500 }}
                            />
                            <YAxis
                                stroke="rgba(97, 28, 175, 0.8)"
                                style={{ fontSize: '0.75rem', fontWeight: 500 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(26, 26, 46, 0.95)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Legend
                                wrapperStyle={{ color: 'rgba(97, 28, 175, 0.9)', fontWeight: 600 }}
                                iconType="line"
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#db2777"
                                strokeWidth={3}
                                name="New Users"
                                dot={{ fill: '#db2777', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 7, fill: '#db2777' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="cumulative"
                                stroke="#9333ea"
                                strokeWidth={3}
                                strokeDasharray="5 5"
                                name="Total Users"
                                dot={{ fill: '#9333ea', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 7, fill: '#9333ea' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </ChartWrapper>

            {/* Role Distribution Pie Chart */}
            <ChartWrapper
                title="Users by Role Distribution"
                loading={loading}
                height={350}
            >
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={analytics?.users_by_role?.filter(role =>
                                role._id &&
                                role._id !== null &&
                                role._id !== '' &&
                                role._id !== 'unknown' &&
                                role._id !== 'null'
                            ).map(role => ({
                                name: role._id.replace('_', ' ').toUpperCase(),
                                value: role.count,
                                _id: role._id
                            })) || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {analytics?.users_by_role?.map((role, index) => {
                                const colors = {
                                    admin: '#9333ea',
                                    web_manager: '#db2777',
                                    doctor: '#14b8a6',
                                    user: '#3b82f6'
                                };
                                const color = colors[role._id] || '#6b7280';
                                return <Cell key={`cell-${index}`} fill={color} />;
                            })}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(26, 26, 46, 0.95)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                        />
                        <Legend
                            wrapperStyle={{ color: 'rgba(97, 28, 175, 0.9)', fontWeight: 600 }}
                            formatter={(value, entry) => `${value}: ${entry.payload.value} users`}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </ChartWrapper>
        </div>
    );
};

export default UserAnalytics;
