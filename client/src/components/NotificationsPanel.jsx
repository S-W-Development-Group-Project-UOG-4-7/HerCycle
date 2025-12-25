import { useState, useEffect, useCallback } from 'react';
import { Bell, X, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * NotificationsPanel - Dropdown showing course modification alerts for admin/lecturers
 * @param {string} userId - Current user ID
 * @param {string} role - User role (admin/lecturer/student)
 */
export default function NotificationsPanel({ userId, role }) {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    /**
     * Fetch notifications for current user
     * Shows modifications made to their courses by others
     */
    const fetchNotifications = useCallback(async () => {
        if (!userId || role === 'student') return;

        try {
            const response = await fetch(`http://localhost:5000/api/modification-logs/user/${userId}`);
            const data = await response.json();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.notificationRead).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [userId, role]);

    // Poll for new notifications every 10 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    /**
     * Mark a notification as read
     */
    const markAsRead = async (logId) => {
        try {
            await fetch(`http://localhost:5000/api/modification-logs/${logId}/read`, {
                method: 'PUT'
            });
            fetchNotifications(); // Refresh after marking as read
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    /**
     * Format timestamp to relative time
     */
    const formatDate = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    // Don't render for students
    if (role === 'student') return null;

    return (
        <div className="relative">
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notifications Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop - Click to close */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel - Opens upward from bottom */}
                    <div className="absolute right-0 bottom-12 w-80 md:w-96 bg-bg-card border border-slate-800 rounded-3xl shadow-2xl z-50 max-h-[500px] flex flex-col animate-fade-up">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Bell className="text-primary" size={18} />
                                Notifications
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {notifications.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="text-green-500 mx-auto mb-2" size={32} />
                                    <p className="text-slate-500 text-sm">No notifications</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${notif.notificationRead
                                            ? 'bg-slate-800/20 border-slate-800'
                                            : 'bg-primary/10 border-primary/30 hover:bg-primary/15'
                                            }`}
                                        onClick={() => !notif.notificationRead && markAsRead(notif._id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${notif.action === 'delete'
                                                ? 'bg-red-500/20'
                                                : 'bg-blue-500/20'
                                                }`}>
                                                <AlertCircle
                                                    className={notif.action === 'delete' ? 'text-red-400' : 'text-blue-400'}
                                                    size={16}
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-bold text-sm mb-1">
                                                    Course {notif.action === 'delete' ? 'Deleted' : 'Modified'}
                                                </p>
                                                <p className="text-slate-400 text-xs mb-2">
                                                    <span className="font-bold text-white">{notif.courseTitle}</span> was {notif.action}d by {notif.modifierName}
                                                </p>
                                                <p className="text-slate-500 text-xs mb-2 line-clamp-2">
                                                    <strong>Reason:</strong> {notif.reason}
                                                </p>
                                                <p className="text-slate-600 text-xs">{formatDate(notif.createdAt)}</p>
                                            </div>

                                            {/* Unread indicator */}
                                            {!notif.notificationRead && (
                                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0 mt-2" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
