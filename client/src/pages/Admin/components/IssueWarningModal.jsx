// IssueWarningModal.jsx - Modal for issuing warnings to users
import React, { useState } from 'react';
import './IssueWarningModal.css';

const IssueWarningModal = ({ isOpen, onClose, onSubmit, prefilledData = {} }) => {
    const [formData, setFormData] = useState({
        user_nic: prefilledData.user_nic || '',
        user_name: prefilledData.user_name || '',
        user_email: prefilledData.user_email || '',
        reason: prefilledData.reason || '',
        severity: prefilledData.severity || 'medium',
        post_id: prefilledData.post_id || '',
        comment_id: prefilledData.comment_id || '',
        notes: '',
        duration_days: 30
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.user_nic) {
            setError('User NIC is required');
            return;
        }
        if (!formData.reason.trim()) {
            setError('Warning reason is required');
            return;
        }

        setLoading(true);

        try {
            await onSubmit({
                user_nic: formData.user_nic,
                reason: formData.reason,
                severity: formData.severity,
                post_id: formData.post_id || undefined,
                comment_id: formData.comment_id || undefined,
                notes: formData.notes || undefined,
                duration_days: parseInt(formData.duration_days)
            });

            // Reset form and close
            setFormData({
                user_nic: '',
                user_name: '',
                user_email: '',
                reason: '',
                severity: 'medium',
                post_id: '',
                comment_id: '',
                notes: '',
                duration_days: 30
            });
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to issue warning');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="issue-warning-modal-overlay" onClick={onClose}>
            <div className="issue-warning-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>⚠️ Issue Warning</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {error && (
                        <div className="error-alert">
                            {error}
                        </div>
                    )}

                    {/* User Information */}
                    <div className="form-section">
                        <h3>User Information</h3>
                        <div className="form-group">
                            <label>User NIC *</label>
                            <input
                                type="text"
                                value={formData.user_nic}
                                onChange={(e) => handleChange('user_nic', e.target.value)}
                                placeholder="e.g., 123456789V"
                                required
                                disabled={!!prefilledData.user_nic}
                                className="form-input"
                            />
                        </div>

                        {formData.user_name && (
                            <div className="user-info-display">
                                <p><strong>Name:</strong> {formData.user_name}</p>
                                {formData.user_email && <p><strong>Email:</strong> {formData.user_email}</p>}
                            </div>
                        )}
                    </div>

                    {/* Warning Details */}
                    <div className="form-section">
                        <h3>Warning Details</h3>

                        <div className="form-group">
                            <label>Severity *</label>
                            <select
                                value={formData.severity}
                                onChange={(e) => handleChange('severity', e.target.value)}
                                className="form-select"
                                required
                            >
                                <option value="low">🟢 Low - Minor violation</option>
                                <option value="medium">🟡 Medium - Moderate violation</option>
                                <option value="high">🔴 High - Serious violation</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Reason *</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => handleChange('reason', e.target.value)}
                                placeholder="Describe the reason for this warning..."
                                rows="4"
                                required
                                className="form-textarea"
                            />
                        </div>

                        <div className="form-group">
                            <label>Additional Notes (Optional)</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                placeholder="Any additional information..."
                                rows="2"
                                className="form-textarea"
                            />
                        </div>

                        <div className="form-group">
                            <label>Warning Duration (Days)</label>
                            <input
                                type="number"
                                value={formData.duration_days}
                                onChange={(e) => handleChange('duration_days', e.target.value)}
                                min="1"
                                max="365"
                                className="form-input"
                            />
                            <small className="form-hint">Warning will expire after this many days (default: 30)</small>
                        </div>
                    </div>

                    {/* Linked Content (Optional) */}
                    {(formData.post_id || formData.comment_id || !prefilledData.user_nic) && (
                        <div className="form-section">
                            <h3>Linked Content (Optional)</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Post ID</label>
                                    <input
                                        type="text"
                                        value={formData.post_id}
                                        onChange={(e) => handleChange('post_id', e.target.value)}
                                        placeholder="Post ID (if applicable)"
                                        disabled={!!prefilledData.post_id}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Comment ID</label>
                                    <input
                                        type="text"
                                        value={formData.comment_id}
                                        onChange={(e) => handleChange('comment_id', e.target.value)}
                                        placeholder="Comment ID (if applicable)"
                                        disabled={!!prefilledData.comment_id}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Warning Info */}
                    <div className="warning-info-box">
                        <p><strong>⚠️ Important:</strong></p>
                        <ul>
                            <li>This warning will be added to the user's record</li>
                            <li>Users with <strong>3 or more warnings</strong> will be automatically suspended</li>
                            <li>Warning will expire after {formData.duration_days} days</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-danger"
                            disabled={loading}
                        >
                            {loading ? 'Issuing Warning...' : 'Issue Warning'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IssueWarningModal;
