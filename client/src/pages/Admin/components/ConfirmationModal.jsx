import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false,
    children
}) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="confirmation-modal-overlay" onClick={handleOverlayClick}>
            <div className="confirmation-modal">
                <div className="confirmation-modal-header">
                    <h2>{title}</h2>
                    <button
                        className="confirmation-modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                <div className="confirmation-modal-body">
                    {message && <p className="confirmation-modal-message">{message}</p>}
                    {children}
                </div>

                <div className="confirmation-modal-footer">
                    <button
                        className="confirmation-modal-btn confirmation-modal-btn-cancel"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`confirmation-modal-btn ${isDanger ? 'confirmation-modal-btn-danger' : 'confirmation-modal-btn-confirm'}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
