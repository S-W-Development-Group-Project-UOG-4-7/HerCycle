// AdminProfile.jsx
import React, { useState } from 'react';

const AdminProfile = ({ adminData, onUpdate }) => {
    const [formData, setFormData] = useState({
        full_name: adminData?.full_name || '',
        current_password: '',
        password: '',
        confirm_password: '',
        profile_picture: adminData?.profile_picture || ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (formData.password && formData.password !== formData.confirm_password) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const updateData = { full_name: formData.full_name, profile_picture: formData.profile_picture };
            if (formData.password) {
                updateData.password = formData.password;
                updateData.current_password = formData.current_password;
            }

            const res = await fetch('http://localhost:5000/api/admin/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updateData)
            });

            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setFormData({ ...formData, current_password: '', password: '', confirm_password: '' });
                if (onUpdate) onUpdate();
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section-card">
            <div className="section-header">
                <h2 className="section-title"><span className="section-icon"></span>Admin Profile Settings</h2>
            </div>
            {message.text && <div className={`alert alert-${message.type}`} style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px', background: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#991b1b' }}>{message.text}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label className="form-label">Email (Read-only)</label>
                    <input className="form-input" value={adminData?.email || ''} disabled style={{ background: '#f3f4f6', cursor: 'not-allowed' }} />
                </div>
                <div className="form-group">
                    <label className="form-label">Profile Picture URL</label>
                    <input className="form-input" value={formData.profile_picture} onChange={(e) => setFormData({ ...formData, profile_picture: e.target.value })} placeholder="https://..." />
                </div>
                <hr style={{ margin: '2rem 0', border: 'none', borderTop: '2px solid #f3f4f6' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Change Password</h3>
                <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input className="form-input" type="password" value={formData.current_password} onChange={(e) => setFormData({ ...formData, current_password: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input className="form-input" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input className="form-input" type="password" value={formData.confirm_password} onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} />
                </div>
                <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
            </form>
        </div>
    );
};

export default AdminProfile;
