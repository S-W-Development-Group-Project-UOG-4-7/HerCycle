// DoctorVerification.jsx - Doctor License Verification Section
import React, { useState, useEffect, useCallback } from 'react';

const DoctorVerification = () => {
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [approvalNotes, setApprovalNotes] = useState('');
    const [isRejectMode, setIsRejectMode] = useState(false);

    const fetchPendingDoctors = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:5000/api/admin/pending-doctors', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setPendingDoctors(data.data || []);
        } catch (error) {
            console.error('Fetch pending doctors error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingDoctors();
    }, [fetchPendingDoctors]);

    const handleApprove = async (doctorNIC) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:5000/api/admin/approve-doctor/${doctorNIC}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: approvalNotes })
            });
            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Doctor approved successfully!' });
                setSelectedDoctor(null);
                setApprovalNotes('');
                fetchPendingDoctors();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to approve doctor' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        }
    };

    const handleReject = async (doctorNIC) => {
        if (!rejectionReason.trim()) {
            setMessage({ type: 'error', text: 'Please provide a rejection reason' });
            return;
        }
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:5000/api/admin/reject-doctor/${doctorNIC}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectionReason })
            });
            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Doctor rejected successfully!' });
                setSelectedDoctor(null);
                setRejectionReason('');
                fetchPendingDoctors();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to reject doctor' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        }
    };

    const handleViewLicense = (url) => {
        if (url) {
            const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
            window.open(fullUrl, '_blank');
        } else {
            alert('License document URL not available');
        }
    };

    return (
        <div>
            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title"><span className="section-icon"></span>Doctor License Verification</h2>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`} style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
                        {message.text}
                    </div>
                )}

                <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card pink">
                        <div className="stat-value">{pendingDoctors.length}</div>
                        <div className="stat-label">Pending Verifications</div>
                    </div>
                </div>

                {loading ? <div>Loading...</div> : pendingDoctors.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '12px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                        <h3 style={{ marginBottom: '0.5rem', color: '#111827' }}>No Pending Verifications</h3>
                        <p style={{ color: '#6b7280' }}>All doctor applications have been processed.</p>
                    </div>
                ) : (
                    <div className="doctor-cards-grid">
                        {pendingDoctors.map(doctor => (
                            <div key={doctor.doctor_NIC} style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                                            {doctor.user_info?.full_name || 'Unknown Doctor'}
                                        </h3>
                                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{doctor.user_info?.email || 'No email'}</p>
                                    </div>
                                    <span className="badge badge-warning" style={{ height: 'fit-content' }}>⏳ Pending</span>
                                </div>

                                <div className="doctor-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                    <p><strong>NIC:</strong> {doctor.doctor_NIC}</p>
                                    <p><strong>Specialty:</strong> {doctor.doctor_info?.specialty || 'Not specified'}</p>
                                    <p><strong>Qualifications:</strong> {doctor.doctor_info?.qualifications?.join(', ') || 'Not provided'}</p>
                                    <p><strong>Clinic/Hospital:</strong> {doctor.doctor_info?.clinic_or_hospital || 'Not specified'}</p>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {doctor.license_document_url && (
                                        <button onClick={() => handleViewLicense(doctor.license_document_url)} className="secondary-btn" style={{ fontSize: '0.9rem' }}>
                                            📄 View License
                                        </button>
                                    )}
                                    <button onClick={() => { setSelectedDoctor(doctor); setIsRejectMode(false); }} className="primary-btn" style={{ fontSize: '0.9rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                                        ✅ Approve
                                    </button>
                                    <button onClick={() => { setSelectedDoctor(doctor); setIsRejectMode(true); }} className="danger-btn primary-btn" style={{ fontSize: '0.9rem' }}>
                                        ❌ Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedDoctor && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '500px', width: '90%' }}>
                        <h2 style={{ marginBottom: '1rem', color: '#111827' }}>{isRejectMode ? 'Reject Doctor' : 'Approve Doctor'}</h2>

                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                            <p><strong>Name:</strong> {selectedDoctor.user_info?.full_name}</p>
                            <p><strong>NIC:</strong> {selectedDoctor.doctor_NIC}</p>
                            <p><strong>Specialty:</strong> {selectedDoctor.doctor_info?.specialty}</p>
                        </div>

                        {isRejectMode ? (
                            <div className="form-group">
                                <label className="form-label">Rejection Reason *</label>
                                <textarea
                                    className="form-textarea"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Provide a clear reason for rejection..."
                                    rows="4"
                                    required
                                />
                            </div>
                        ) : (
                            <div className="form-group">
                                <label className="form-label">Approval Notes (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    value={approvalNotes}
                                    onChange={(e) => setApprovalNotes(e.target.value)}
                                    placeholder="Add any notes about this approval..."
                                    rows="3"
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={() => { setSelectedDoctor(null); setRejectionReason(''); setApprovalNotes(''); }} className="secondary-btn">
                                Cancel
                            </button>
                            <button
                                onClick={() => isRejectMode ? handleReject(selectedDoctor.doctor_NIC) : handleApprove(selectedDoctor.doctor_NIC)}
                                className={isRejectMode ? "danger-btn primary-btn" : "primary-btn"}
                                style={isRejectMode ? {} : { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                                disabled={isRejectMode && !rejectionReason.trim()}
                            >
                                {isRejectMode ? 'Confirm Rejection' : 'Confirm Approval'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorVerification;
