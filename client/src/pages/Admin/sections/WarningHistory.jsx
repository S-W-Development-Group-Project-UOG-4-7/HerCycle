// WarningHistory.jsx - With user suspension functionality
import React, { useState, useEffect, useCallback } from 'react';

const WarningHistory = () => {
    const [warnings, setWarnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ severity: '', user_nic: '', is_active: '' });
    const [suspendingUser, setSuspendingUser] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchWarnings = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const params = new URLSearchParams();
            if (filter.severity) params.append('severity', filter.severity);
            if (filter.user_nic) params.append('user_nic', filter.user_nic);
            if (filter.is_active) params.append('is_active', filter.is_active);

            const res = await fetch(`http://localhost:5000/api/admin/warnings?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setWarnings(data.data);
        } catch (error) {
            console.error('Error fetching warnings:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchWarnings();
    }, [fetchWarnings]);

    const suspendUser = async (userNic, duration) => {
        setSuspendingUser(userNic);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5000/api/admin/suspend-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ user_nic: userNic, duration })
            });

            const data = await res.json();
            if (data.success || res.ok) {
                setMessage({ type: 'success', text: `User suspended for ${duration}` });
                fetchWarnings();
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to suspend user' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to suspend user' });
        } finally {
            setSuspendingUser(null);
        }
    };

    const SuspendMenu = ({ userNic }) => {
        const [showMenu, setShowMenu] = useState(false);

        const durations = [
            { label: '1 Week', value: '1week' },
            { label: '3 Weeks', value: ' 3weeks' },
            { label: '1 Month', value: '1month' },
            { label: '3 Months', value: '3months' }
        ];

        return (
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="danger-btn primary-btn"
                    disabled={suspendingUser === userNic}
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                    {suspendingUser === userNic ? 'Suspending...' : 'Suspend User'}
                </button>
                {showMenu && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 10,
                        minWidth: '150px'
                    }}>
                        {durations.map(duration => (
                            <button
                                key={duration.value}
                                onClick={() => {
                                    suspendUser(userNic, duration.value);
                                    setShowMenu(false);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: 'white',
                                    border: 'none',
                                    borderBottom: '1px solid #f3f4f6',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    color: '#374151'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                                {duration.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="section-card">
            <div className="section-header">
                <h2 className="section-title"><span className="section-icon"></span>Warning History & User Suspension</h2>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`} style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
                    {message.text}
                </div>
            )}

            <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <select className="form-select" value={filter.severity} onChange={(e) => setFilter({ ...filter, severity: e.target.value })} style={{ width: 'auto', minWidth: '150px' }}>
                    <option value="">All Severities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <select className="form-select" value={filter.is_active} onChange={(e) => setFilter({ ...filter, is_active: e.target.value })} style={{ width: 'auto', minWidth: '150px' }}>
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Expired</option>
                </select>
            </div>

            {loading ? <div>Loading...</div> : (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Reason</th>
                                <th>Severity</th>
                                <th>Given By</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warnings.map(warning => (
                                <tr key={warning.warning_id}>
                                    <td data-label="User">{warning.user_info?.full_name || warning.user_nic}</td>
                                    <td data-label="Email" style={{ fontSize: '0.85rem' }}>{warning.user_info?.email || 'N/A'}</td>
                                    <td data-label="Reason">{warning.reason}</td>
                                    <td data-label="Severity">
                                        <span className={`badge badge-${warning.severity}`} style={{ textTransform: 'capitalize' }}>
                                            {warning.severity}
                                        </span>
                                    </td>
                                    <td data-label="Given By">{warning.given_by}</td>
                                    <td data-label="Date">{new Date(warning.given_at).toLocaleDateString()}</td>
                                    <td data-label="Status">
                                        <span className={`badge ${warning.is_active ? 'badge-success' : 'badge-gray'}`}>
                                            {warning.is_active ? 'Active' : 'Expired'}
                                        </span>
                                    </td>
                                    <td data-label="Action">
                                        <SuspendMenu userNic={warning.user_nic} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default WarningHistory;
