// GiveCredentials.jsx - Simplified without permissions, with validation
import React, { useState, useEffect } from 'react';

const GiveCredentials = () => {
    const [formData, setFormData] = useState({
        NIC: '', full_name: '', email: '', password: ''
    });
    const [webManagers, setWebManagers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [validationErrors, setValidationErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchWebManagers();
    }, []);

    const fetchWebManagers = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/admin/web-managers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setWebManagers(data.data);
        } catch (error) {
            console.error('Error fetching web managers:', error);
        }
    };

    const validateNIC = (nic) => {
        // Sri Lankan NIC: 10 characters (old format) or 12 characters (new format)
        const nicPattern = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
        if (!nic) return 'NIC is required';
        if (!nicPattern.test(nic)) {
            return 'NIC must be 10 characters (9 digits + V/X) or 12 digits';
        }
        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
        if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return 'Password must contain at least one special character';
        return '';
    };

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });

        // Clear validation error for this field
        setValidationErrors({ ...validationErrors, [field]: '' });

        // Real-time validation
        if (field === 'NIC') {
            const error = validateNIC(value);
            if (error) setValidationErrors({ ...validationErrors, NIC: error });
        } else if (field === 'password') {
            const error = validatePassword(value);
            if (error) setValidationErrors({ ...validationErrors, password: error });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        const nicError = validateNIC(formData.NIC);
        const passwordError = validatePassword(formData.password);

        if (nicError || passwordError) {
            setValidationErrors({ NIC: nicError, password: passwordError });
            setMessage({ type: 'error', text: 'Please fix validation errors' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/admin/create-web-manager', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Web Manager created successfully!' });
                setFormData({ NIC: '', full_name: '', email: '', password: '' });
                setValidationErrors({});
                fetchWebManagers();
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to create web manager' });
        } finally {
            setLoading(false);
        }
    };

    const updateWebManager = async (nic, is_active) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5000/api/admin/web-managers/${nic}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ is_active })
            });
            const data = await res.json();
            if (data.success || res.ok) {
                setMessage({
                    type: 'success',
                    text: is_active ? `Web Manager (${nic}) has been activated` : `Web Manager (${nic}) has been deactivated`
                });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
            fetchWebManagers();
        } catch (error) {
            console.error('Error updating web manager:', error);
            setMessage({ type: 'error', text: 'Failed to update web manager status' });
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '#e5e7eb' };
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength++;

        const levels = [
            { strength: 1, label: 'Very Weak', color: '#ef4444' },
            { strength: 2, label: 'Weak', color: '#f97316' },
            { strength: 3, label: 'Fair', color: '#eab308' },
            { strength: 4, label: 'Good', color: '#22c55e' },
            { strength: 5, label: 'Strong', color: '#10b981' }
        ];

        return levels.find(l => l.strength === strength) || levels[0];
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <div>
            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title"><span className="section-icon"></span>Create Web Manager Account</h2>
                </div>
                {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">NIC *</label>
                        <input
                            className={`form-input ${validationErrors.NIC ? 'error' : ''}`}
                            value={formData.NIC}
                            onChange={(e) => handleInputChange('NIC', e.target.value.toUpperCase())}
                            placeholder="e.g., 199512345678 or 995123456V"
                            maxLength="12"
                            required
                        />
                        {validationErrors.NIC && <small style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{validationErrors.NIC}</small>}
                        <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                            10 characters (old: 9 digits + V/X) or 12 digits (new format)
                        </small>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                            className="form-input"
                            value={formData.full_name}
                            onChange={(e) => handleInputChange('full_name', e.target.value)}
                            placeholder="Enter full name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                            className="form-input"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="email@example.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password *</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                className={`form-input ${validationErrors.password ? 'error' : ''}`}
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                placeholder="Enter strong password"
                                required
                                style={{ paddingRight: '3rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.25rem'
                                }}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {formData.password && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <div style={{ flex: 1, height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${(passwordStrength.strength / 5) * 100}%`,
                                            height: '100%',
                                            background: passwordStrength.color,
                                            transition: 'all 0.3s ease'
                                        }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: passwordStrength.color }}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                            </div>
                        )}
                        {validationErrors.password && <small style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{validationErrors.password}</small>}
                        <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                            Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
                        </small>
                    </div>
                    <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Creating...' : 'Create Web Manager'}</button>
                </form>
            </div>

            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title"><span className="section-icon"></span>Existing Web Managers</h2>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>NIC</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {webManagers.map(wm => (
                                <tr key={wm.NIC}>
                                    <td data-label="Name">{wm.user_info?.full_name || 'N/A'}</td>
                                    <td data-label="Email">{wm.user_info?.email || 'N/A'}</td>
                                    <td data-label="NIC">{wm.NIC}</td>
                                    <td data-label="Status"><span className={`badge ${wm.is_active ? 'badge-success' : 'badge-danger'}`}>{wm.is_active ? 'Active' : 'Inactive'}</span></td>
                                    <td data-label="Actions">
                                        <button onClick={() => updateWebManager(wm.NIC, !wm.is_active)} className="secondary-btn" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                                            {wm.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GiveCredentials;
