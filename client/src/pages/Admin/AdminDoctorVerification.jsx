import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css'; // Using shared admin dashboard styles

const AdminDoctorVerification = () => {
  const navigate = useNavigate();
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allVerifications, setAllVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const checkAdminAccess = useCallback(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('authToken');

    if (!user || !token || user.role !== 'admin') {
      navigate('/login');
      return false;
    }
    return true;
  }, [navigate]);

  const fetchPendingDoctors = useCallback(async () => {
    if (!checkAdminAccess()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch('http://localhost:5000/api/admin/pending-doctors', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server error (${response.status})`);
      }

      if (data.success) {
        setPendingDoctors(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch pending doctors');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
      console.error('Fetch pending doctors error:', err);
    } finally {
      setLoading(false);
    }
  }, [checkAdminAccess]);

  const fetchAllVerifications = useCallback(async () => {
    if (!checkAdminAccess()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      // Add status filter only if not 'all'
      if (activeTab !== 'all' && activeTab !== 'pending') {
        queryParams.append('status', activeTab);
      }

      const response = await fetch(
        `http://localhost:5000/api/admin/all-doctor-verifications?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server error (${response.status})`);
      }

      if (data.success) {
        setAllVerifications(data.data || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0
        }));
      } else {
        setError(data.message || 'Failed to fetch verifications');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
      console.error('Fetch verifications error:', err);
    } finally {
      setLoading(false);
    }
  }, [checkAdminAccess, activeTab, pagination.page, pagination.limit]);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingDoctors();
    } else {
      fetchAllVerifications();
    }
  }, [activeTab, pagination.page, fetchPendingDoctors, fetchAllVerifications]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset pagination to page 1 when changing tabs
    if (tab !== 'pending') {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://localhost:5000/api/admin/approve-doctor/${doctorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: approvalNotes
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Doctor approved successfully!`);
        setApprovalNotes('');
        setSelectedDoctor(null);
        setIsRejectMode(false);

        // Refresh the list
        if (activeTab === 'pending') {
          fetchPendingDoctors();
        } else {
          fetchAllVerifications();
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to approve doctor');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Approve error:', err);
    }
  };

  const handleReject = async (doctorId) => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://localhost:5000/api/admin/reject-doctor/${doctorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: rejectionReason,
          notes: ''
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Doctor rejected successfully!`);
        setRejectionReason('');
        setSelectedDoctor(null);
        setIsRejectMode(false);

        // Refresh the list
        if (activeTab === 'pending') {
          fetchPendingDoctors();
        } else {
          fetchAllVerifications();
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to reject doctor');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Reject error:', err);
    }
  };

  const handleViewLicense = (url) => {
    if (url) {
      // Ensure URL is properly formatted
      const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
      window.open(fullUrl, '_blank');
    } else {
      alert('License document URL not available');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-pending">⏳ Pending</span>;
      case 'approved':
        return <span className="badge badge-approved">✅ Approved</span>;
      case 'rejected':
        return <span className="badge badge-rejected">❌ Rejected</span>;
      case 'under_review':
        return <span className="badge badge-review">🔍 Review</span>;
      default:
        return <span className="badge badge-unknown">❓ Unknown</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const openApproveModal = (doctor) => {
    setSelectedDoctor(doctor);
    setIsRejectMode(false);
    setApprovalNotes('');
    setRejectionReason('');
  };

  const openRejectModal = (doctor) => {
    setSelectedDoctor(doctor);
    setIsRejectMode(true);
    setRejectionReason('');
    setApprovalNotes('');
  };

  const closeModal = () => {
    setSelectedDoctor(null);
    setIsRejectMode(false);
    setRejectionReason('');
    setApprovalNotes('');
  };

  const confirmAction = () => {
    if (!selectedDoctor) return;

    // Use NIC as the identifier (as per your original code)
    const doctorNIC = selectedDoctor.doctor_NIC;

    if (isRejectMode) {
      if (!rejectionReason.trim()) {
        alert('Please provide a rejection reason');
        return;
      }
      if (window.confirm('Are you sure you want to reject this doctor?')) {
        handleReject(doctorNIC);
      }
    } else {
      if (window.confirm('Are you sure you want to approve this doctor?')) {
        handleApprove(doctorNIC);
      }
    }
  };

  if (loading && pendingDoctors.length === 0 && allVerifications.length === 0) {
    return (
      <div className="admin-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading verification panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <h1>👑 Admin Panel - Doctor Verification</h1>
            <p>Manage doctor applications and verifications</p>
          </div>
          <div className="header-actions">
            <button onClick={() => navigate('/admin-dashboard')} className="btn-secondary">
              ← Back to Dashboard
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary">
              🏠 Home
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="btn-logout"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
          <button onClick={() => setError('')} className="alert-close">×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {success}
          <button onClick={() => setSuccess('')} className="alert-close">×</button>
        </div>
      )}

      {/* Main Content */}
      <div className="admin-content">
        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card stat-pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{pendingDoctors.length}</h3>
              <p>Pending Verifications</p>
            </div>
          </div>
          <div className="stat-card stat-total">
            <div className="stat-icon">👨‍⚕️</div>
            <div className="stat-content">
              <h3>{pagination.total}</h3>
              <p>Total Applications</p>
            </div>
          </div>
          <div className="stat-card stat-approved">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{allVerifications.filter(v => v.status === 'approved').length}</h3>
              <p>Approved Doctors</p>
            </div>
          </div>
          <div className="stat-card stat-rejected">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>{allVerifications.filter(v => v.status === 'rejected').length}</h3>
              <p>Rejected Applications</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => handleTabChange('pending')}
          >
            ⏳ Pending ({pendingDoctors.length})
          </button>
          <button
            className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => handleTabChange('approved')}
          >
            ✅ Approved
          </button>
          <button
            className={`tab ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => handleTabChange('rejected')}
          >
            ❌ Rejected
          </button>
          <button
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            📋 All Applications
          </button>
        </div>

        {/* Doctor List */}
        <div className="doctors-list">
          {activeTab === 'pending' && pendingDoctors.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <h3>No Pending Verifications</h3>
              <p>All doctor applications have been processed.</p>
            </div>
          )}

          {activeTab !== 'pending' && allVerifications.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No Verifications Found</h3>
              <p>No doctor applications match the selected filter.</p>
            </div>
          )}

          {(activeTab === 'pending' ? pendingDoctors : allVerifications).map((doctor) => (
            <div key={doctor.verification_id || doctor.doctor_NIC} className="doctor-card">
              <div className="doctor-card-header">
                <div className="doctor-basic-info">
                  <h3>{doctor.user_info?.full_name || 'Unknown Doctor'}</h3>
                  <p className="doctor-email">{doctor.user_info?.email || 'No email'}</p>
                  <div className="doctor-meta">
                    <span className="meta-item">NIC: {doctor.doctor_NIC}</span>
                    <span className="meta-item">Specialty: {doctor.doctor_info?.specialty || 'Not specified'}</span>
                    {doctor.submitted_at && (
                      <span className="meta-item">
                        Applied: {formatDate(doctor.submitted_at)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="doctor-status">
                  {getStatusBadge(doctor.status)}
                  {doctor.reviewed_at && (
                    <span className="review-date">
                      Reviewed: {formatDate(doctor.reviewed_at)}
                    </span>
                  )}
                </div>
              </div>

              <div className="doctor-card-body">
                <div className="doctor-details">
                  <div className="detail-section">
                    <h4>Professional Information</h4>
                    <p><strong>Qualifications:</strong> {doctor.doctor_info?.qualifications?.join(', ') || 'Not provided'}</p>
                    <p><strong>Clinic/Hospital:</strong> {doctor.doctor_info?.clinic_or_hospital || 'Not specified'}</p>
                  </div>

                  <div className="detail-section">
                    <h4>Contact Information</h4>
                    <p><strong>Phone:</strong> {doctor.user_info?.contact_number || 'Not provided'}</p>
                    <p><strong>Gender:</strong> {doctor.user_info?.gender || 'Not specified'}</p>
                  </div>

                  {doctor.registration_details && (
                    <div className="detail-section">
                      <h4>Registration Details</h4>
                      <p>{doctor.registration_details}</p>
                    </div>
                  )}

                  {doctor.rejection_reason && (
                    <div className="detail-section">
                      <h4>Rejection Reason</h4>
                      <p className="rejection-reason">{doctor.rejection_reason}</p>
                    </div>
                  )}
                </div>

                <div className="doctor-actions">
                  {doctor.license_document_url && (
                    <button
                      onClick={() => handleViewLicense(doctor.license_document_url)}
                      className="btn-view-license"
                    >
                      📄 View License Document
                    </button>
                  )}

                  {doctor.status === 'pending' && (
                    <div className="action-buttons">
                      <button
                        onClick={() => openApproveModal(doctor)}
                        className="btn-approve"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(doctor)}
                        className="btn-reject"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {activeTab !== 'pending' && pagination.pages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page <= 1}
              className="pagination-btn"
            >
              ← Previous
            </button>

            <span className="pagination-info">
              Page {pagination.page} of {pagination.pages}
            </span>

            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.pages}
              className="pagination-btn"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Approval/Rejection Modal */}
      {selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {isRejectMode ? 'Reject Doctor' : 'Approve Doctor'}
              </h2>
              <button onClick={closeModal} className="modal-close">×</button>
            </div>

            <div className="modal-body">
              <p>
                You are about to <strong>{isRejectMode ? 'REJECT' : 'APPROVE'}</strong>:
              </p>
              <div className="doctor-summary">
                <p><strong>Name:</strong> {selectedDoctor.user_info?.full_name || 'N/A'}</p>
                <p><strong>NIC:</strong> {selectedDoctor.doctor_NIC || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedDoctor.user_info?.email || 'N/A'}</p>
                <p><strong>Specialty:</strong> {selectedDoctor.doctor_info?.specialty || 'N/A'}</p>
              </div>

              {isRejectMode ? (
                <div className="form-group">
                  <label htmlFor="rejectionReason">Rejection Reason *</label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a clear reason for rejection..."
                    rows="4"
                    required
                  />
                  <small>This reason will be shown to the doctor</small>
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="approvalNotes">Approval Notes (Optional)</label>
                  <textarea
                    id="approvalNotes"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Add any notes about this approval..."
                    rows="3"
                  />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={closeModal} className="btn-cancel">
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={isRejectMode ? 'btn-confirm-reject' : 'btn-confirm-approve'}
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

export default AdminDoctorVerification;
