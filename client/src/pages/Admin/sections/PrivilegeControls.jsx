// PrivilegeControls.jsx - Role-based privilege management with tabs
import React, { useState, useEffect } from 'react';

const PrivilegeControls = () => {
    const [activeTab, setActiveTab] = useState('web_managers'); // 'web_managers' or 'users'
    const [webManagers, setWebManagers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Role permissions state
    const [rolePermissions, setRolePermissions] = useState({
        user: {
            view_posts: true,
            create_posts: true,
            comment: true,
            like: true,
            track_cycle: false,
            view_campaigns: true,
            donate: true
        },
        doctor: {
            view_posts: true,
            create_posts: true,
            comment: true,
            like: true,
            verify_info: true,
            moderate_posts: true,
            view_reports: false
        },
        cycle_user: {
            view_posts: true,
            create_posts: true,
            comment: true,
            like: true,
            track_cycle: true,
            view_analytics: true,
            export_data: true
        }
    });

    useEffect(() => {
        if (activeTab === 'web_managers') {
            fetchWebManagers();
        } else {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchWebManagers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/admin/web-managers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setWebManagers(data.data || []);
        } catch (error) {
            console.error('Error fetching web managers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setUsers(data.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionToggle = (nic, permission) => {
        setWebManagers(prev => prev.map(wm =>
            wm.NIC === nic
                ? { ...wm, permissions: { ...wm.permissions, [permission]: !wm.permissions[permission] } }
                : wm
        ));
    };

    const saveWebManagerPermissions = async (nic) => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        const webManager = webManagers.find(wm => wm.NIC === nic);
        if (!webManager) return;

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5000/api/admin/web-manager/${nic}/permissions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ permissions: webManager.permissions })
            });

            const data = await res.json();
            if (data.success || res.ok) {
                setMessage({ type: 'success', text: `Permissions updated for ${webManager.user_info?.full_name || 'Web Manager'}` });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update permissions' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to update permissions' });
        } finally {
            setLoading(false);
        }
    };

    const permissionLabels = {
        posts: 'Manage Posts',
        comments: 'Manage Comments',
        campaigns: 'Manage Campaigns',
        reports: 'Handle Reports',
        donations: 'View Donations',
        landing_page: 'Edit Landing Page',
        fundraising: 'Manage Fundraising'
    };

    // Helper function to get permissions for a role
    const getRolePermissions = (role) => {
        const permissionSets = {
            user: ['view_posts', 'create_posts', 'comment', 'like', 'track_cycle', 'view_campaigns', 'donate'],
            doctor: ['view_posts', 'create_posts', 'comment', 'like', 'verify_info', 'moderate_posts', 'view_reports'],
            cycle_user: ['view_posts', 'create_posts', 'comment', 'like', 'track_cycle', 'view_analytics', 'export_data']
        };
        return permissionSets[role] || [];
    };

    // Helper function to get permission labels
    const getPermissionLabel = (permission) => {
        const labels = {
            view_posts: 'View Posts',
            create_posts: 'Create Posts',
            comment: 'Comment on Posts',
            like: 'Like Posts',
            track_cycle: 'Track Cycle',
            view_campaigns: 'View Campaigns',
            donate: 'Make Donations',
            verify_info: 'Verify Medical Info',
            moderate_posts: 'Moderate Posts',
            view_reports: 'View Reports',
            view_analytics: 'View Analytics',
            export_data: 'Export Data'
        };
        return labels[permission] || permission;
    };

    // Handle role permission toggle
    const handleRolePermissionToggle = (role, permission) => {
        setRolePermissions(prev => ({
            ...prev,
            [role]: {
                ...prev[role],
                [permission]: !prev[role]?.[permission]
            }
        }));
    };

    // Save role permissions
    const saveRolePermissions = async (role) => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5000/api/admin/role-privileges/${role}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ privileges: rolePermissions[role] })
            });

            const data = await res.json();
            if (data.success || res.ok) {
                setMessage({ type: 'success', text: `Permissions updated for ${role} role` });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update permissions' });
            }
        } catch (error) {
            console.error('Error saving role permissions:', error);
            setMessage({ type: 'error', text: 'Failed to update permissions' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section-card">
            <div className="section-header">
                <h2 className="section-title"><span className="section-icon">🔐</span>Privilege Controls</h2>
            </div>
            <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
                Manage permissions for web managers and users. Changes apply immediately.
            </p>

            {message.text && <div className={`alert alert-${message.type}`} style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>{message.text}</div>}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
                <button
                    onClick={() => setActiveTab('web_managers')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'web_managers' ? '3px solid #db2777' : '3px solid transparent',
                        color: activeTab === 'web_managers' ? '#db2777' : '#6b7280',
                        fontWeight: activeTab === 'web_managers' ? 600 : 500,
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease'
                    }}
                >
                    👨‍💼 Web Managers ({webManagers.length})
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'users' ? '3px solid #db2777' : '3px solid transparent',
                        color: activeTab === 'users' ? '#db2777' : '#6b7280',
                        fontWeight: activeTab === 'users' ? 600 : 500,
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease'
                    }}
                >
                    👥 Users ({users.length})
                </button>
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>}

            {/* Web Managers Tab */}
            {!loading && activeTab === 'web_managers' && (
                webManagers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '12px' }}>
                        <p style={{ color: '#6b7280' }}>No web managers found</p>
                    </div>
                ) : (
                    webManagers.map(wm => (
                        <div key={wm.NIC} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                                        {wm.user_info?.full_name || 'Web Manager'}
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                        {wm.user_info?.email || wm.NIC} • ID: {wm.W_ID}
                                    </p>
                                </div>
                                <span style={{
                                    padding: '0.375rem 0.75rem',
                                    background: wm.is_active ? '#d1fae5' : '#fee2e2',
                                    color: wm.is_active ? '#065f46' : '#991b1b',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600
                                }}>
                                    {wm.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                                {Object.keys(permissionLabels).map(permission => (
                                    <label key={permission} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                        <input
                                            type="checkbox"
                                            checked={wm.permissions?.[permission] || false}
                                            onChange={() => handlePermissionToggle(wm.NIC, permission)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ flex: 1, fontSize: '0.9rem', color: '#374151' }}>
                                            {permissionLabels[permission]}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <button
                                onClick={() => saveWebManagerPermissions(wm.NIC)}
                                className="primary-btn"
                                disabled={loading}
                                style={{ fontSize: '0.9rem', padding: '0.6rem 1.25rem' }}
                            >
                                {loading ? 'Saving...' : 'Save Permissions'}
                            </button>
                        </div>
                    ))
                )
            )}

            {/* Users Tab - Role-Based Privileges */}
            {!loading && activeTab === 'users' && (
                <div>
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#e0f2fe', borderRadius: '8px', border: '1px solid #0284c7' }}>
                        <p style={{ color: '#0369a1', fontSize: '0.9rem', margin: 0 }}>
                            <strong>ℹ️ Role-Based Privileges:</strong> Set default permissions for each user role. Individual users inherit these permissions based on their assigned role.
                        </p>
                    </div>

                    {['user', 'doctor', 'cycle_user'].map(role => (
                        <div key={role} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                                        {role === 'user' ? '👥 Community Users' : role === 'doctor' ? '👨‍⚕️ Doctors' : '📅 Cycle Tracking Users'}
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                        {role === 'user' ? 'Regular community members' : role === 'doctor' ? 'Verified medical professionals' : 'Users with cycle tracking access'}
                                    </p>
                                </div>
                                <span style={{
                                    padding: '0.375rem 0.75rem',
                                    background: '#dbeafe',
                                    color: '#1e40af',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600
                                }}>
                                    Role: {role}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                                {getRolePermissions(role).map(permission => (
                                    <label key={permission} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                        <input
                                            type="checkbox"
                                            checked={rolePermissions[role]?.[permission] || false}
                                            onChange={() => handleRolePermissionToggle(role, permission)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ flex: 1, fontSize: '0.9rem', color: '#374151' }}>
                                            {getPermissionLabel(permission)}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <button
                                onClick={() => saveRolePermissions(role)}
                                className="primary-btn"
                                disabled={loading}
                                style={{ fontSize: '0.9rem', padding: '0.6rem 1.25rem' }}
                            >
                                {loading ? 'Saving...' : `Save ${role === 'user' ? 'User' : role === 'doctor' ? 'Doctor' : 'Cycle User'} Permissions`}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PrivilegeControls;
