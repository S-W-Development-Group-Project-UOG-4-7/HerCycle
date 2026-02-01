// DoctorVerification.jsx - Doctor License Verification Section with Activation Controls
import React, { useState, useEffect, useCallback } from 'react';
import DoctorPostsModal from '../components/DoctorPostsModal';
import RequestInfoModal from '../components/RequestInfoModal';

const DoctorVerification = () => {
    const [activeView, setActiveView] = useState('pending'); // 'pending' or 'all'
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [approvalNotes, setApprovalNotes] = useState('');
    const [isRejectMode, setIsRejectMode] = useState(false);
    const [statusModalDoctor, setStatusModalDoctor] = useState(null);
    const [specialtySearch, setSpecialtySearch] = useState(''); // Search state
    const [postsModalDoctor, setPostsModalDoctor] = useState(null); // For viewing posts
    const [requestInfoDoctor, setRequestInfoDoctor] = useState(null); // For requesting info

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

    const fetchAllDoctors = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:5000/api/admin/doctors?status=approved', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setAllDoctors(data.data || []);
        } catch (error) {
            console.error('Fetch all doctors error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeView === 'pending') {
            fetchPendingDoctors();
        } else {
            fetchAllDoctors();
        }
    }, [activeView, fetchPendingDoctors, fetchAllDoctors]);

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

    const handleToggleDoctorStatus = async (doctorNIC, currentStatus) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:5000/api/admin/doctors/${doctorNIC}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !currentStatus })
            });
            const data = await response.json();
            if (data.success) {
                setMessage({
                    type: 'success',
                    text: `Doctor ${!currentStatus ? 'activated' : 'deactivated'} successfully!`
                });
                setStatusModalDoctor(null);
                fetchAllDoctors();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update doctor status' });
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

    // Filter doctors based on specialty search
    const filterDoctorsBySpecialty = (doctors) => {
        if (!specialtySearch.trim()) return doctors;
        return doctors.filter(doctor => {
            const specialty = doctor.doctor_info?.specialty || doctor.specialty || '';
            return specialty.toLowerCase().includes(specialtySearch.toLowerCase());
        });
    };

    const filteredPendingDoctors = filterDoctorsBySpecialty(pendingDoctors);
    const filteredAllDoctors = filterDoctorsBySpecialty(allDoctors);

    return (
        <div>
            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title"><span className="section-icon"></span>Doctor Management</h2>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`} style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
                        {message.text}
                    </div>
                )}

                {/* Search Box */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Search by Specialty
                    </label>
                    <input
                        type="text"
                        placeholder="🔍 Type to filter doctors by specialty (e.g., cardiology, gynecology)..."
                        className="form-input"
                        value={specialtySearch}
                        onChange={(e) => setSpecialtySearch(e.target.value)}
                        style={{ width: '100%', maxWidth: '600px' }}
                    />
                    {specialtySearch && (
                        <small style={{ display: 'block', marginTop: '0.5rem', color: '#6b7280' }}>
                            Filtered results: {activeView === 'pending' ? filteredPendingDoctors.length : filteredAllDoctors.length} doctor(s)
                            <button
                                onClick={() => setSpecialtySearch('')}
                                style={{
                                    marginLeft: '1rem',
                                    background: 'none',
                                    border: 'none',
                                    color: '#db2777',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                Clear search
                            </button>
                        </small>
                    )}
                </div>

                {/* Tab Switcher */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
                    <button
                        onClick={() => setActiveView('pending')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeView === 'pending' ? '3px solid #db2777' : '3px solid transparent',
                            color: activeView === 'pending' ? '#db2777' : '#6b7280',
                            fontWeight: activeView === 'pending' ? 600 : 500,
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        🔔 Pending Verifications ({filteredPendingDoctors.length})
                    </button>
                    <button
                        onClick={() => setActiveView('all')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeView === 'all' ? '3px solid #db2777' : '3px solid transparent',
                            color: activeView === 'all' ? '#db2777' : '#6b7280',
                            fontWeight: activeView === 'all' ? 600 : 500,
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        👥 All Doctors ({allDoctors.length})
                    </button>
                </div>

                {/* Pending Verifications View */}
                {activeView === 'pending' && (
                    <>
                        {loading ? <div>Loading...</div> : filteredPendingDoctors.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '12px' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                                <h3 style={{ marginBottom: '0.5rem', color: '#111827' }}>
                                    {specialtySearch ? 'No Matching Doctors' : 'No Pending Verifications'}
                                </h3>
                                <p style={{ color: '#6b7280' }}>
                                    {specialtySearch ? `No pending doctors found with specialty containing "${specialtySearch}"` : 'All doctor applications have been processed.'}
                                </p>
                            </div>
                        ) : (
                            <div className="doctor-cards-grid">
                                {filteredPendingDoctors.map((doctor) => (
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
                                            <button
                                                onClick={() => setPostsModalDoctor({ nic: doctor.doctor_NIC, name: doctor.user_info?.full_name || 'Doctor' })}
                                                className="secondary-btn"
                                                style={{ fontSize: '0.9rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)', border: '1px solid #3b82f6', color: '#3b82f6' }}
                                            >
                                                📝 View Posts
                                            </button>
                                            <button
                                                onClick={() => setRequestInfoDoctor({ nic: doctor.doctor_NIC, name: doctor.user_info?.full_name || 'Doctor' })}
                                                className="secondary-btn"
                                                style={{ fontSize: '0.9rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)', border: '1px solid #f59e0b', color: '#f59e0b' }}
                                            >
                                                ❓ Request Info
                                            </button>
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
                    </>
                )}

                {/* All Doctors View */}
                {activeView === 'all' && (
                    <>
                        {loading ? <div>Loading...</div> : filteredAllDoctors.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '12px' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                                <h3 style={{ marginBottom: '0.5rem', color: '#111827' }}>
                                    {specialtySearch ? 'No Matching Doctors' : 'No Doctors Found'}
                                </h3>
                                <p style={{ color: '#6b7280' }}>
                                    {specialtySearch ? `No doctors found with specialty containing "${specialtySearch}"` : 'No doctors in the system yet.'}
                                </p>
                            </div>
                        ) : (
                            <div className="doctor-cards-grid">
                                {filteredAllDoctors.map((doctor) => (
                                    <div key={doctor.NIC} style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                                                    {doctor.user_info?.full_name || 'Unknown Doctor'}
                                                </h3>
                                                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{doctor.user_info?.email || 'No email'}</p>
                                            </div>
                                            <span className={`badge ${doctor.is_active ? 'badge-success' : 'badge-gray'}`} style={{ height: 'fit-content' }}>
                                                {doctor.is_active ? '✓ Active' : '⊘ Inactive'}
                                            </span>
                                        </div>

                                        <div className="doctor-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                            <p><strong>NIC:</strong> {doctor.NIC}</p>
                                            <p><strong>Specialty:</strong> {doctor.specialty || 'Not specified'}</p>
                                            <p><strong>Qualifications:</strong> {doctor.qualifications?.join(', ') || 'Not provided'}</p>
                                            <p><strong>Clinic/Hospital:</strong> {doctor.clinic_or_hospital || 'Not specified'}</p>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => setStatusModalDoctor(doctor)}
                                                className={doctor.is_active ? 'secondary-btn' : 'primary-btn'}
                                                style={{ fontSize: '0.9rem' }}
                                            >
                                                {doctor.is_active ? '🚫 Deactivate' : '✅ Activate'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div >

            {/* Verification Modal */}
            {
                selectedDoctor && (
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
                )
            }

            {/* Status Change Modal */}
            {
                statusModalDoctor && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '450px', width: '90%' }}>
                            <h2 style={{ marginBottom: '1rem', color: '#111827' }}>
                                {statusModalDoctor.is_active ? 'Deactivate Doctor' : 'Activate Doctor'}
                            </h2>

                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <p><strong>Name:</strong> {statusModalDoctor.user_info?.full_name}</p>
                                <p><strong>NIC:</strong> {statusModalDoctor.NIC}</p>
                                <p><strong>Specialty:</strong> {statusModalDoctor.specialty}</p>
                            </div>

                            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                                {statusModalDoctor.is_active
                                    ? 'Are you sure you want to deactivate this doctor? They will not be able to access doctor features.'
                                    : 'Are you sure you want to activate this doctor? They will regain access to doctor features.'}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setStatusModalDoctor(null)} className="secondary-btn">
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleToggleDoctorStatus(statusModalDoctor.NIC, statusModalDoctor.is_active)}
                                    className={statusModalDoctor.is_active ? "danger-btn primary-btn" : "primary-btn"}
                                    style={!statusModalDoctor.is_active ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' } : {}}
                                >
                                    {statusModalDoctor.is_active ? 'Confirm Deactivation' : 'Confirm Activation'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Doctor Posts Modal */}
            {postsModalDoctor && (
                <DoctorPostsModal
                    doctorNIC={postsModalDoctor.nic}
                    doctorName={postsModalDoctor.name}
                    onClose={() => setPostsModalDoctor(null)}
                />
            )}

            {/* Request Info Modal */}
            {requestInfoDoctor && (
                <RequestInfoModal
                    doctorNIC={requestInfoDoctor.nic}
                    doctorName={requestInfoDoctor.name}
                    onClose={() => setRequestInfoDoctor(null)}
                    onSuccess={(msg) => {
                        setMessage({ type: 'success', text: msg });
                        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                    }}
                />
            )}
        </div >
    );
};

export default DoctorVerification;
