// RequestInfoModal.jsx
// PHASE 3: Modal for admin to request additional information from doctor via email
// Useful for incomplete applications or when clarification is needed during verification
import React, { useState } from 'react';
import './RequestInfoModal.css';

const RequestInfoModal = ({ doctorNIC, doctorName, onClose, onSuccess }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) {
            alert('Please enter a message');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:5000/api/admin/doctor/request-info', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nic: doctorNIC, message })
            });

            const data = await response.json();
            if (data.success) {
                onSuccess('Information request sent successfully!');
                onClose();
            } else {
                alert(data.message || 'Failed to send request');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="request-info-modal-overlay" onClick={onClose}>
            <div className="request-info-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>❓ Request More Information</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-content">
                    <p className="doctor-name">Dr. {doctorName}</p>
                    <label className="form-label">Message to Doctor:</label>
                    <textarea
                        className="form-textarea"
                        rows="6"
                        placeholder="Enter your message here... (e.g., Please provide a clearer photo of your medical license)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                <div className="modal-footer">
                    <button className="secondary-btn" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button className="primary-btn" onClick={handleSend} disabled={loading}>
                        {loading ? 'Sending...' : '📧 Send Request'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestInfoModal;
