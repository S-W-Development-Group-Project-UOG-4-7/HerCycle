// PrivilegeControls.jsx - Role-based privilege management
import React, { useState } from 'react';

const PrivilegeControls = () => {
    const [rolePrivileges, setRolePrivileges] = useState({
        web_manager: { posts: true, comments: true, campaigns: true, reports: true, donations: true, landing_page: true, fundraising: true, user_management: false },
        community_user: { create_posts: true, create_comments: true, report_content: true, like_posts: true },
        doctor: { verify_medical_content: true, post_articles: true, respond_to_queries: true, view_reports: true },
        user: { cycle_tracking: true, view_content: true, participate_community: true }
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const roleDescriptions = {
        web_manager: 'Web Managers - Manage website content and moderate community',
        community_user: 'Community Users - Active community members with posting privileges',
        doctor: 'Doctors - Verified medical professionals',
        user: 'Regular Users - Standard application users'
    };

    const handlePrivilegeToggle = (role, privilege) => {
        setRolePrivileges(prev => ({
            ...prev,
            [role]: {
                ...prev[role],
                [privilege]: !prev[role][privilege]
            }
        }));
    };

    const saveRolePrivileges = async (role) => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5000/api/admin/role-privileges/${role}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ privileges: rolePrivileges[role] })
            });

            const data = await res.json();
            if (data.success || res.ok) {
                setMessage({ type: 'success', text: `${role.replace('_', ' ')} privileges updated successfully!` });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update privileges' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to update privileges' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section-card">
            <div className="section-header">
                <h2 className="section-title"><span className="section-icon"></span>Role-Based Privilege Controls</h2>
            </div>
            <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
                Manage what each role can do in the system. Changes apply to all users with that role.
            </p>

            {message.text && <div className={`alert alert-${message.type}`} style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>{message.text}</div>}

            {Object.keys(rolePrivileges).map(role => (
                <div key={role} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'capitalize', color: '#111827' }}>
                        {role.replace('_', ' ')}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                        {roleDescriptions[role]}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                        {Object.keys(rolePrivileges[role]).map(privilege => (
                            <label key={privilege} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                <input
                                    type="checkbox"
                                    checked={rolePrivileges[role][privilege]}
                                    onChange={() => handlePrivilegeToggle(role, privilege)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{ textTransform: 'capitalize', flex: 1, fontSize: '0.9rem', color: '#374151' }}>
                                    {privilege.replace(/_/g, ' ')}
                                </span>
                            </label>
                        ))}
                    </div>

                    <button
                        onClick={() => saveRolePrivileges(role)}
                        className="primary-btn"
                        disabled={loading}
                        style={{ fontSize: '0.9rem', padding: '0.6rem 1.25rem' }}
                    >
                        {loading ? 'Saving...' : `Save ${role.replace('_', ' ')} Privileges`}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default PrivilegeControls;
