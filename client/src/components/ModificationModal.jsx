import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * ModificationModal - Requires reason when admin edits/deletes courses they didn't create
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close handler
 * @param {function} onConfirm - Submit handler with reason
 * @param {string} action - Type of modification ('edit' or 'delete')
 * @param {string} courseTitle - Name of course being modified
 */
export default function ModificationModal({ isOpen, onClose, onConfirm, action, courseTitle }) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    /**
     * Validate and submit reason
     * Requires minimum 10 characters
     */
    const handleSubmit = () => {
        if (reason.trim().length < 10) {
            setError('Reason must be at least 10 characters long');
            return;
        }
        onConfirm(reason);
        // Reset state after submission
        setReason('');
        setError('');
    };

    /**
     * Close modal and reset state
     */
    const handleClose = () => {
        setReason('');
        setError('');
        onClose();
    };

    /**
     * Handle Enter key to submit (Shift+Enter for new line)
     */
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && reason.trim().length >= 10) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-up">
            <div className="bg-bg-card border border-slate-800 rounded-3xl p-4 md:p-8 max-w-lg w-full shadow-2xl">
                {/* ===== HEADER ===== */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-500/10 p-2 md:p-3 rounded-2xl flex-shrink-0">
                            <AlertTriangle className="text-red-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-white">
                                {action === 'delete' ? 'Delete Course' : 'Edit Course'}
                            </h2>
                            <p className="text-slate-400 text-xs md:text-sm mt-1">This action requires a reason</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* ===== COURSE INFO ===== */}
                <div className="bg-slate-800/30 rounded-2xl p-4 mb-6">
                    <p className="text-slate-400 text-xs md:text-sm mb-1">Course:</p>
                    <p className="text-white font-bold text-sm md:text-base break-words">{courseTitle}</p>
                </div>

                {/* ===== REASON INPUT ===== */}
                <div className="mb-6">
                    <label className="block text-white font-bold mb-2 text-sm md:text-base">
                        Reason for {action === 'delete' ? 'Deletion' : 'Edit'}*
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            setError(''); // Clear error on typing
                        }}
                        onKeyDown={handleKeyPress}
                        placeholder="Enter a detailed reason (minimum 10 characters)..."
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors resize-none"
                        rows={4}
                        autoFocus
                    />
                    {/* Error message */}
                    {error && (
                        <p className="text-red-400 text-xs md:text-sm mt-2">{error}</p>
                    )}
                    {/* Character count */}
                    <p className={`text-xs mt-2 ${reason.length >= 10 ? 'text-green-400' : 'text-slate-500'}`}>
                        {reason.length}/10 characters minimum
                    </p>
                </div>

                {/* ===== WARNING ===== */}
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 md:p-4 mb-6">
                    <p className="text-orange-300 text-xs md:text-sm">
                        {action === 'delete'
                            ? 'The course creator will be notified of this deletion. This action cannot be undone.'
                            : 'The course creator will be notified of these changes.'}
                    </p>
                </div>

                {/* ===== ACTION BUTTONS ===== */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 md:px-6 rounded-xl transition-all text-sm md:text-base"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={reason.trim().length < 10}
                        className={`flex-1 font-bold py-3 px-4 md:px-6 rounded-xl transition-all text-sm md:text-base ${reason.trim().length < 10
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : action === 'delete'
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-primary hover:bg-primary/80 text-white'
                            }`}
                    >
                        {action === 'delete' ? 'Delete Course' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
