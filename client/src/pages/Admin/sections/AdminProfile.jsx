// AdminProfile.jsx
import React, { useState, useRef } from 'react';

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
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(adminData?.profile_picture ? `http://localhost:5000${adminData.profile_picture}` : '');
    const fileInputRef = useRef(null);

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                setMessage({ type: 'error', text: 'Only JPEG, JPG, and PNG images are allowed' });
                return;
            }
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'File size must be less than 5MB' });
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setMessage({ type: '', text: '' });
        }
    };

    // Upload profile picture
    const uploadProfilePicture = async () => {
        if (!selectedFile) return formData.profile_picture;

        const uploadFormData = new FormData();
        uploadFormData.append('profilePicture', selectedFile);

        const token = localStorage.getItem('authToken');
        const res = await fetch('http://localhost:5000/api/upload/profile-picture', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: uploadFormData
        });

        const data = await res.json();
        if (data.success) {
            return data.url;
        } else {
            throw new Error(data.message || 'Failed to upload image');
        }
    };

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
            // Upload profile picture first if a new file is selected
            let profilePictureUrl = formData.profile_picture;
            if (selectedFile) {
                profilePictureUrl = await uploadProfilePicture();
            }

            const token = localStorage.getItem('authToken');
            const updateData = { full_name: formData.full_name, profile_picture: profilePictureUrl };
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
                setFormData({ ...formData, current_password: '', password: '', confirm_password: '', profile_picture: profilePictureUrl });
                setSelectedFile(null);
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
                {/* Profile Picture Upload */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Profile Picture</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {/* Preview */}
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '3px solid #e5e7eb',
                            background: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Profile Preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <span style={{ fontSize: '2.5rem', color: '#9ca3af' }}>👤</span>
                            )}
                        </div>
                        {/* Upload Button */}
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/jpeg,image/jpg,image/png"
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'linear-gradient(135deg, #db2777, #be24fb)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                📷 Choose Image
                            </button>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                JPG, JPEG, or PNG (max 5MB)
                            </p>
                            {selectedFile && (
                                <p style={{ fontSize: '0.875rem', color: '#059669', marginTop: '0.25rem' }}>
                                    ✓ {selectedFile.name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label className="form-label">Email (Read-only)</label>
                    <input className="form-input" value={adminData?.email || ''} disabled style={{ background: '#f3f4f6', cursor: 'not-allowed' }} />
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

