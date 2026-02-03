// WarningHistory.jsx - Enhanced with tabs and suspended users management
import React, { useState, useEffect, useCallback } from 'react';
import IssueWarningModal from '../components/IssueWarningModal';
import CountdownTimer from '../components/CountdownTimer';

const WarningHistory = () => {
    const [activeTab, setActiveTab] = useState('warnings'); // 'warnings' or 'suspended'
    const [warnings, setWarnings] = useState([]);
    const [suspendedUsers, setSuspendedUsers] = useState([]);
    const [suspendedUserNICs, setSuspendedUserNICs] = useState([]); // Track suspended user NICs for filtering
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ severity: '', user_nic: '', is_active: '' });
    const [suspendingUser, setSuspendingUser] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showIssueWarningModal, setShowIssueWarningModal] = useState(false);
    const [modalData, setModalData] = useState({});

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

    const fetchSuspendedUsers = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5000/api/admin/suspended-users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSuspendedUsers(data.data);
                // Extract NICs for filtering warnings
                setSuspendedUserNICs(data.data.map(user => user.NIC));
            }
        } catch (error) {
            console.error('Error fetching suspended users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch suspended users list on mount to enable filtering
    useEffect(() => {
        fetchSuspendedUsers();
    }, [fetchSuspendedUsers]);

    useEffect(() => {
        if (activeTab === 'warnings') {
            fetchWarnings();
        } else {
            fetchSuspendedUsers();
        }
    }, [activeTab, fetchWarnings, fetchSuspendedUsers]);

    // Filter warnings to exclude suspended users
    const activeWarnings = warnings.filter(warning => !suspendedUserNICs.includes(warning.user_nic));

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
                // Switch to suspended users tab
                setActiveTab('suspended');
                // Refresh both lists
                fetchWarnings();
                fetchSuspendedUsers();
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to suspend user' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to suspend user' });
        } finally {
            setSuspendingUser(null);
        }
    };

    const handleUnsuspend = async (userNic) => {
        if (!window.confirm('Are you sure you want to unsuspend this user?')) return;

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/admin/unsuspend-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ user_nic: userNic })
            });

            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'User unsuspended successfully!' });
                fetchSuspendedUsers(); // Refresh list
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to unsuspend user' });
            }
        } catch (error) {
            console.error('Unsuspend error:', error);
            setMessage({ type: 'error', text: 'Failed to unsuspend user' });
        }
    };

    const handleIssueWarning = async (warningData) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/admin/give-warning', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(warningData)
            });

            const data = await res.json();

            if (data.success || res.ok) {
                setMessage({ type: 'success', text: 'Warning issued successfully!' });
                fetchWarnings(); // Reload warnings
            } else {
                throw new Error(data.message || 'Failed to issue warning');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
            throw error;
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
                <h2 className="section-title"><span className="section-icon"></span>Warning History & User Management</h2>
                <button
                    onClick={() => {
                        setModalData({});
                        setShowIssueWarningModal(true);
                    }}
                    className="primary-btn"
                    style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                >
                    ⚠️ Issue Warning
                </button>
            </div>

            {/* Issue Warning Modal */}
            <IssueWarningModal
                isOpen={showIssueWarningModal}
                onClose={() => setShowIssueWarningModal(false)}
                onSubmit={handleIssueWarning}
                prefilledData={modalData}
            />

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '2px solid #e0e0e0'
            }}>
                <button
                    onClick={() => setActiveTab('warnings')}
                    style={{
                        padding: '1rem 2rem',
                        border: 'none',
                        background: activeTab === 'warnings' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                        color: activeTab === 'warnings' ? 'white' : '#666',
                        borderRadius: '8px 8px 0 0',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                    }}
                >
                    ⚠️ Warning History ({activeWarnings.length})
                </button>
                <button
                    onClick={() => setActiveTab('suspended')}
                    style={{
                        padding: '1rem 2rem',
                        border: 'none',
                        background: activeTab === 'suspended' ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)' : 'transparent',
                        color: activeTab === 'suspended' ? 'white' : '#666',
                        borderRadius: '8px 8px 0 0',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                    }}
                >
                    🚫 Suspended Users ({suspendedUsers.length})
                </button>
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

            {/* Warning History Tab */}
            {activeTab === 'warnings' && (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Reason</th>
                                <th>Severity</th>
                                <th>Source</th>
                                <th>Given By</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>Loading warnings...</td></tr>
                            ) : activeWarnings.length === 0 ? (
                                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No active warnings (suspended users filtered out)</td></tr>
                            ) : (
                                activeWarnings.map(warning => (
                                    <tr key={warning.warning_id}>
                                        <td data-label="User">{warning.user_info?.full_name || warning.user_nic}</td>
                                        <td data-label="Email" style={{ fontSize: '0.85rem' }}>{warning.user_info?.email || 'N/A'}</td>
                                        <td data-label="Reason">
                                            {warning.reason}
                                            {warning.notes && (
                                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                                                    Note: {warning.notes}
                                                </div>
                                            )}
                                        </td>
                                        <td data-label="Severity">
                                            <span className={`badge badge-${warning.severity}`} style={{ textTransform: 'capitalize' }}>
                                                {warning.severity}
                                            </span>
                                        </td>
                                        <td data-label="Source">
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                background: warning.given_by === 'SYSTEM' ? '#e3f2fd' : warning.reason.includes('Report') ? '#fff3e0' : '#f3e5f5',
                                                color: warning.given_by === 'SYSTEM' ? '#1976d2' : warning.reason.includes('Report') ? '#f57c00' : '#7b1fa2'
                                            }}>
                                                {warning.given_by === 'SYSTEM' ? '🤖 Auto' : warning.reason.includes('Report') ? '📋 Report' : '👤 Manual'}
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )
            }

            {/* Suspended Users Tab */}
            {
                activeTab === 'suspended' && (
                    <div style={{ padding: '1rem' }}>
                        {loading ? <div>Loading suspended users...</div> : (
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Email</th>
                                            <th>Warnings</th>
                                            <th>Suspended Until</th>
                                            <th>Time Remaining</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {suspendedUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                                                    No suspended users
                                                </td>
                                            </tr>
                                        ) : (
                                            suspendedUsers.map(user => (
                                                <tr key={user.NIC}>
                                                    <td data-label="User">{user.full_name || user.NIC}</td>
                                                    <td data-label="Email">{user.email}</td>
                                                    <td data-label="Warnings">
                                                        <span style={{
                                                            background: user.warning_count >= 3 ? '#f44336' : '#ff9800',
                                                            color: 'white',
                                                            padding: '4px 12px',
                                                            borderRadius: '12px',
                                                            fontWeight: '600'
                                                        }}>
                                                            {user.warning_count} warnings
                                                        </span>
                                                    </td>
                                                    <td data-label="Suspended Until">
                                                        {new Date(user.suspension_end).toLocaleString()}
                                                    </td>
                                                    <td data-label="Time Remaining">
                                                        <CountdownTimer
                                                            targetDate={user.suspension_end}
                                                            onExpire={() => {
                                                                setMessage({ type: 'info', text: `${user.full_name} suspension expired!` });
                                                                fetchSuspendedUsers();
                                                            }}
                                                        />
                                                    </td>
                                                    <td data-label="Action">
                                                        <button
                                                            onClick={() => handleUnsuspend(user.NIC)}
                                                            style={{
                                                                padding: '0.5rem 1rem',
                                                                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontWeight: '600',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            ✅ Unsuspend
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    );
};

export default WarningHistory;
