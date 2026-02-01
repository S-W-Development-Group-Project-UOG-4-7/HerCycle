// DoctorVerificationHistory.jsx
// PHASE 3: Displays historical log of all doctor verifications for admin audit trail
// Shows doctor status (approved/pending), submission dates, and verification details
import React, { useState, useEffect } from 'react';

const DoctorVerificationHistory = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, approved, pending

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:5000/api/admin/doctor-verifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setDoctors(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doctor => {
        if (filter === 'all') return true;
        if (filter === 'approved') return doctor.is_approved && doctor.verified;
        if (filter === 'pending') return !doctor.is_approved;
        return false;
    });

    const getStatusBadge = (doctor) => {
        if (doctor.is_approved && doctor.verified) {
            return <span className="badge badge-success">✅ Approved</span>;
        }
        return <span className="badge badge-warning">⏳ Pending</span>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="section-card">
            <div className="section-header">
                <h2 className="section-title">📜 Doctor Verification History</h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '0.5rem' }}>
                    View all doctor verification records and their current status
                </p>
            </div>

            {/* Filters */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? 'primary-btn' : 'secondary-btn'}
                >
                    All ({doctors.length})
                </button>
                <button
                    onClick={() => setFilter('approved')}
                    className={filter === 'approved' ? 'primary-btn' : 'secondary-btn'}
                    style={filter === 'approved' ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' } : {}}
                >
                    Approved ({doctors.filter(d => d.is_approved).length})
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={filter === 'pending' ? 'primary-btn' : 'secondary-btn'}
                    style={filter === 'pending' ? { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' } : {}}
                >
                    Pending ({doctors.filter(d => !d.is_approved).length})
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '1rem' }}>Loading history...</p>
                </div>
            ) : filteredDoctors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Records Found</h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No verification records match your filter.</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Doctor Name</th>
                                <th>Email</th>
                                <th>Specialty</th>
                                <th>License #</th>
                                <th>Status</th>
                                <th>Submitted</th>
                                <th>Verified</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDoctors.map(doctor => (
                                <tr key={doctor.NIC}>
                                    <td>{doctor.user_name}</td>
                                    <td>{doctor.user_email}</td>
                                    <td>{doctor.specialty || 'N/A'}</td>
                                    <td>{doctor.license_number || 'N/A'}</td>
                                    <td>{getStatusBadge(doctor)}</td>
                                    <td>{formatDate(doctor.created_at)}</td>
                                    <td>{doctor.verified_at ? formatDate(doctor.verified_at) : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DoctorVerificationHistory;
