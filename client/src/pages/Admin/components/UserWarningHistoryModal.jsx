// UserWarningHistoryModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './ConfirmationModal.css'; // Reuse the modal styles
import './UserWarningHistoryModal.css';

/**
 * Modal component to display warning history for a specific user
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback to close modal
 * @param {string} userNIC - NIC of user to fetch warnings for
 * @param {string} userName - Name of user for display
 */
const UserWarningHistoryModal = ({ isOpen, onClose, userNIC, userName }) => {
    const [warnings, setWarnings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch warnings when modal opens
    const fetchWarnings = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/user-warnings/${userNIC}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setWarnings(data.data);
            } else {
                setError(data.message || 'Failed to load warnings');
            }
        } catch (error) {
            console.error('Error fetching warnings:', error);
            setError('Failed to fetch warning history');
        } finally {
            setLoading(false);
        }
    }, [userNIC]);

    useEffect(() => {
        if (isOpen && userNIC) {
            fetchWarnings();
        }
    }, [isOpen, userNIC, fetchWarnings]);

    const getSeverityBadge = (severity) => {
        const classes = {
            low: 'badge-low',
            medium: 'badge-medium',
            high: 'badge-high'
        };
        return classes[severity] || 'badge-gray';
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content warning-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>⚠️ Warning History</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* User Info */}
                    <div className="warning-user-info">
                        <h3>{userName}</h3>
                        <p style={{ color: 'rgb(97, 28, 175)', marginTop: '0.25rem' }}>NIC: {userNIC}</p>
                        <p style={{ color: 'rgb(97, 28, 175)', fontWeight: 600 }}>
                            Total Warnings: {warnings.length}
                        </p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="loader"></div>
                            <p style={{ color: 'rgb(97, 28, 175)', marginTop: '1rem' }}>Loading warnings...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    {/* Warnings List */}
                    {!loading && !error && warnings.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'rgb(97, 28, 175)' }}>
                            <p>✅ No warnings on record</p>
                        </div>
                    )}

                    {!loading && warnings.length > 0 && (
                        <div className="warnings-list">
                            {warnings.map((warning, index) => (
                                <div key={warning._id || index} className="warning-item">
                                    <div className="warning-header">
                                        <span className={`badge ${getSeverityBadge(warning.severity)}`}>
                                            {warning.severity?.toUpperCase() || 'N/A'}
                                        </span>
                                        <span className="warning-date">
                                            {new Date(warning.warned_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="warning-details">
                                        <p><strong>Reason:</strong> {warning.warning_reason}</p>
                                        {warning.content_id && (
                                            <p><strong>Related Content:</strong> {warning.content_id}</p>
                                        )}
                                        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                            Issued by: {warning.admin_nic?.full_name || warning.admin_nic || 'Admin'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="secondary-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserWarningHistoryModal;
