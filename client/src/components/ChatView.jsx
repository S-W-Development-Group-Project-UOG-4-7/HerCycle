import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, User, Clock } from 'lucide-react';

export default function ChatView({ user, showToast }) {
    // ==================== STATE MANAGEMENT ====================
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [lecturers, setLecturers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // ==================== DATA FETCHING ====================

    /**
     * Fetch available users based on role
     * - Admin sees all lecturers
     * - Lecturer sees admin + all other lecturers
     */
    const fetchUsers = useCallback(async () => {
        try {
            if (user.role === 'admin') {
                const response = await fetch('http://localhost:5000/api/admin/lecturers');
                const data = await response.json();
                setLecturers(data);
            } else if (user.role === 'lecturer') {
                const response = await fetch('http://localhost:5000/api/users/contacts');
                const allUsers = await response.json();

                // Get admin and all other lecturers (excluding self)
                const availableUsers = allUsers.filter(u =>
                    (u.role === 'admin' || u.role === 'lecturer') && u.id !== user.id
                );

                setLecturers(availableUsers);

                // Auto-select admin if available, otherwise first lecturer
                const admin = availableUsers.find(u => u.role === 'admin');
                if (admin) {
                    setSelectedUser(admin);
                } else if (availableUsers.length > 0) {
                    setSelectedUser(availableUsers[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }, [user.role, user.id]);


    /**
     * Mark unread messages as read
     */
    const markMessagesAsRead = useCallback(async (msgs) => {
        const unreadMessages = msgs.filter(m =>
            m.recipientId._id.toString() === user.id.toString() && !m.read
        );

        for (const msg of unreadMessages) {
            try {
                await fetch(`http://localhost:5000/api/messages/${msg._id}/read`, {
                    method: 'PUT'
                });
            } catch (error) {
                console.error('Error marking message as read:', error);
            }
        }
    }, [user.id]);

    /**
     * Fetch messages for current conversation
     * Filters by selected user and marks new messages as read
     */
    const fetchMessages = useCallback(async () => {
        if (!user?.id || !selectedUser) return;

        try {
            const response = await fetch(`http://localhost:5000/api/messages/${user.id}`);
            const data = await response.json();

            // Filter messages for current conversation only
            // Convert all IDs to strings for proper comparison
            const filtered = data.filter(msg => {
                const senderIdStr = msg.senderId._id.toString();
                const recipientIdStr = msg.recipientId._id.toString();
                const userIdStr = user.id.toString();
                const selectedUserIdStr = selectedUser.id.toString();

                const senderMatch = senderIdStr === selectedUserIdStr && recipientIdStr === userIdStr;
                const recipientMatch = recipientIdStr === selectedUserIdStr && senderIdStr === userIdStr;
                return senderMatch || recipientMatch;
            });

            // Sort by createdAt to ensure proper order
            const sorted = filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setMessages(sorted);

            // Auto-mark received messages as read
            markMessagesAsRead(sorted);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, [user?.id, selectedUser, markMessagesAsRead]);


    // ==================== EFFECTS ====================

    // Fetch users on mount
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Poll for new messages every 3 seconds when conversation is active
    useEffect(() => {
        if (selectedUser) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000); // Faster polling for real-time feel
            return () => clearInterval(interval);
        }
    }, [selectedUser, fetchMessages]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ==================== HANDLERS ====================

    /**
     * Send a new message
     */
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedUser) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: user.id,
                    senderRole: user.role,
                    recipientId: selectedUser.id,
                    message: newMessage
                })
            });

            if (response.ok) {
                setNewMessage('');
                fetchMessages(); // Immediately fetch to show sent message
            } else {
                showToast('Failed to send message', 'error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            showToast('Failed to send message', 'error');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Smooth scroll to latest message
     */
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    /**
     * Format timestamp to human-readable format
     */
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // ==================== RENDER ====================

    return (
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100vh-200px)]">
            {/* ===== USER LIST SIDEBAR ===== */}
            <div className="w-full md:w-80 bg-bg-card border border-slate-800 rounded-3xl p-4 md:p-6 flex flex-col max-h-64 md:max-h-full">
                <h3 className="text-lg md:text-xl font-black text-white mb-4 flex items-center gap-2">
                    <MessageCircle className="text-primary" size={20} />
                    {user.role === 'admin' ? 'Lecturers' : 'Contacts'}
                </h3>

                <div className="flex-1 overflow-y-auto space-y-2">
                    {lecturers.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-8">
                            No {user.role === 'admin' ? 'lecturers' : 'conversations'} available
                        </p>
                    ) : (
                        lecturers.map((lecturer) => (
                            <button
                                key={lecturer.id}
                                onClick={() => setSelectedUser(lecturer)}
                                className={`w-full text-left p-3 md:p-4 rounded-2xl transition-all ${selectedUser?.id === lecturer.id
                                    ? 'bg-primary/20 border border-primary'
                                    : 'bg-slate-800/30 hover:bg-slate-800/50 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-gradient-to-br from-primary to-secondary w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="text-white" size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-bold truncate text-sm md:text-base">{lecturer.name}</p>
                                        <p className="text-slate-400 text-xs truncate">{lecturer.email}</p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* ===== CHAT AREA ===== */}
            <div className="flex-1 bg-bg-card border border-slate-800 rounded-3xl flex flex-col min-h-[400px] md:min-h-0">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 md:p-6 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-primary to-secondary w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="text-white" size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg md:text-xl font-bold text-white truncate">{selectedUser.name}</h3>
                                    <p className="text-slate-400 text-xs md:text-sm truncate">{selectedUser.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                            {messages.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-slate-500 text-center text-sm md:text-base">
                                        No messages yet. Start the conversation!
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isOwn = msg.senderId._id.toString() === user.id.toString();
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 break-words ${isOwn
                                                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                                                    : 'bg-slate-800 text-white'
                                                    }`}
                                            >
                                                <p className="text-sm">{msg.message}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Clock size={10} className="opacity-70" />
                                                    <p className="text-xs opacity-70">{formatTime(msg.createdAt)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 md:p-6 border-t border-slate-800">
                            <div className="flex gap-2 md:gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={loading || !newMessage.trim()}
                                    className="bg-gradient-to-r from-primary to-secondary text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
                                >
                                    <Send size={18} className="hidden md:block" />
                                    <span className="text-sm md:text-base">Send</span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    // Empty state - no conversation selected
                    <div className="h-full flex items-center justify-center p-8">
                        <div className="text-center">
                            <MessageCircle className="text-slate-600 mx-auto mb-4" size={48} />
                            <p className="text-slate-500 text-sm md:text-base">
                                Select a {user.role === 'admin' ? 'lecturer' : 'contact'} to start chatting
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
