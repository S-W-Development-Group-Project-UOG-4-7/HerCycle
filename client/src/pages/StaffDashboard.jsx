import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, DollarSign, FileText, AlertCircle, TrendingUp, Users, Heart, Mail } from 'lucide-react';
import Toast from '../components/Toast';

export default function StaffDashboard({ user, showToast: parentShowToast }) {
    const [activeView, setActiveView] = useState('overview');
    const [stats, setStats] = useState({
        totalInquiries: 0,
        activeFundraisers: 0,
        totalDonations: 0,
        pendingFeedback: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [contactMessages, setContactMessages] = useState([]);

    const showToast = parentShowToast || ((message, type = 'success') => setToast({ message, type }));

    const fetchStats = useCallback(async () => {
        try {
            setIsLoading(true);
            // Fetch staff-specific statistics
            const response = await fetch('http://localhost:5000/api/staff/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching staff stats:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        fetchContactMessages();
    }, [fetchStats]);

    const fetchContactMessages = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/contact/all');
            if (response.ok) {
                const data = await response.json();
                setContactMessages(data);

                // Update pending feedback count based on new/unread messages
                const pendingCount = data.filter(msg => msg.status === 'new').length;
                setStats(prev => ({ ...prev, pendingFeedback: pendingCount, totalInquiries: data.length }));
            }
        } catch (error) {
            console.error('Error fetching contact messages:', error);
        }
    };

    const handleUpdateContactStatus = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:5000/api/contact/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                showToast(`Message marked as ${status}`, 'success');
                fetchContactMessages(); // Refresh list
            }
        } catch {
            showToast('Failed to update status', 'error');
        }
    };

    const statsCards = [
        {
            label: 'User Inquiries',
            value: stats.totalInquiries || 0,
            icon: MessageSquare,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            iconColor: 'text-blue-400',
            view: 'feedback' // Changed to feedback since inquiries shows contact messages
        },
        {
            label: 'Active Fundraisers',
            value: stats.activeFundraisers || 0,
            icon: Heart,
            color: 'from-pink-500 to-rose-500',
            bgColor: 'bg-pink-500/10',
            iconColor: 'text-pink-400',
            view: 'fundraisers'
        },
        {
            label: 'Total Donations',
            value: `$${stats.totalDonations?.toLocaleString() || '0'}`,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            iconColor: 'text-green-400',
            view: 'fundraisers'
        },
        {
            label: 'Pending Feedback',
            value: stats.pendingFeedback || 0,
            icon: AlertCircle,
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-500/10',
            iconColor: 'text-orange-400',
            view: 'feedback'
        }
    ];

    const renderContent = () => {
        switch (activeView) {
            case 'inquiries':
                return (
                    <div className="bg-bg-card border border-slate-800 rounded-3xl p-8">
                        <h3 className="text-2xl font-bold text-white mb-4">User Inquiries</h3>
                        <p className="text-slate-400">Manage user questions and support requests from the contact form.</p>
                        <div className="mt-6 text-slate-500 text-sm">
                            Coming soon: User inquiry management interface
                        </div>
                    </div>
                );

            case 'fundraisers':
                return (
                    <div className="bg-bg-card border border-slate-800 rounded-3xl p-8">
                        <h3 className="text-2xl font-bold text-white mb-4">Fundraiser Management</h3>
                        <p className="text-slate-400">Create and manage fundraising campaigns, track donations.</p>
                        <div className="mt-6">
                            <a
                                href="/fundraiser"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                            >
                                <Heart size={20} />
                                Go to Fundraiser Portal
                            </a>
                        </div>
                    </div>
                );

            case 'content':
                return (
                    <div className="bg-bg-card border border-slate-800 rounded-3xl p-8">
                        <h3 className="text-2xl font-bold text-white mb-4">Content Management</h3>
                        <p className="text-slate-400 mb-6">Manage FAQs, newsletters, and platform content.</p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                <FileText className="w-8 h-8 text-secondary mb-3" />
                                <h4 className="text-white font-bold mb-2">FAQs</h4>
                                <p className="text-sm text-slate-400 mb-4">Add, edit, and manage frequently asked questions</p>
                                <button className="text-secondary text-sm font-bold hover:underline">
                                    Manage FAQs →
                                </button>
                            </div>
                            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                <Mail className="w-8 h-8 text-primary mb-3" />
                                <h4 className="text-white font-bold mb-2">Newsletters</h4>
                                <p className="text-sm text-slate-400 mb-4">Create and send newsletters to users</p>
                                <button className="text-primary text-sm font-bold hover:underline">
                                    Manage Newsletters →
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'feedback':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Contact Messages</h2>
                            <button
                                onClick={fetchContactMessages}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Refresh
                            </button>
                        </div>

                        {contactMessages.length === 0 ? (
                            <div className="bg-slate-800/50 rounded-2xl p-12 text-center">
                                <p className="text-slate-400">No contact messages yet</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {contactMessages.map((message) => (
                                    <div
                                        key={message._id}
                                        className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-primary/50 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="bg-gradient-to-br from-primary to-secondary w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                                        {message.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-white font-bold text-lg">{message.name}</h3>
                                                        <p className="text-slate-400 text-sm">{message.email}</p>
                                                        <p className="text-slate-500 text-xs mt-1">
                                                            {new Date(message.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="ml-15 space-y-2">
                                                    <div>
                                                        <span className="text-slate-500 text-sm font-medium">Subject:</span>
                                                        <p className="text-white font-semibold">{message.subject}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 text-sm font-medium">Message:</span>
                                                        <p className="text-slate-300 mt-1 leading-relaxed">{message.message}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 ml-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${message.status === 'new' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    message.status === 'read' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-green-500/20 text-green-400'
                                                    }`}>
                                                    {message.status.toUpperCase()}
                                                </span>

                                                {message.status === 'new' && (
                                                    <button
                                                        onClick={() => handleUpdateContactStatus(message._id, 'read')}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                                                    >
                                                        Mark Read
                                                    </button>
                                                )}
                                                {message.status === 'read' && (
                                                    <button
                                                        onClick={() => handleUpdateContactStatus(message._id, 'responded')}
                                                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                                                    >
                                                        Responded
                                                    </button>
                                                )}
                                                <a
                                                    href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                                                    className="bg-primary hover:bg-primary-dark text-white text-xs px-3 py-1 rounded-lg text-center transition-colors"
                                                >
                                                    Reply
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            default: // overview
                return (
                    <>
                        {/* Welcome Section */}
                        <div className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 rounded-3xl p-8 mb-8">
                            <h2 className="text-3xl font-black text-white mb-2">Welcome, {user.name}!</h2>
                            <p className="text-slate-300">Staff Dashboard - Manage platform operations and user support</p>
                        </div>

                        {/* Quick Links */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div
                                className="bg-bg-card border border-slate-800 rounded-3xl p-6 hover:border-blue-500/50 transition-all cursor-pointer"
                                onClick={() => setActiveView('inquiries')}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-blue-500/10 p-3 rounded-xl">
                                        <MessageSquare className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">User Inquiries</h4>
                                        <p className="text-sm text-slate-500">Respond to user questions</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="bg-bg-card border border-slate-800 rounded-3xl p-6 hover:border-pink-500/50 transition-all cursor-pointer"
                                onClick={() => setActiveView('fundraisers')}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-pink-500/10 p-3 rounded-xl">
                                        <Heart className="w-6 h-6 text-pink-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">Fundraisers</h4>
                                        <p className="text-sm text-slate-500">Manage campaigns & donations</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="bg-bg-card border border-slate-800 rounded-3xl p-6 hover:border-purple-500/50 transition-all cursor-pointer"
                                onClick={() => setActiveView('content')}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-purple-500/10 p-3 rounded-xl">
                                        <FileText className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">Content Management</h4>
                                        <p className="text-sm text-slate-500">FAQs & Newsletters</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="bg-bg-card border border-slate-800 rounded-3xl p-6 hover:border-orange-500/50 transition-all cursor-pointer"
                                onClick={() => setActiveView('feedback')}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-orange-500/10 p-3 rounded-xl">
                                        <AlertCircle className="w-6 h-6 text-orange-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">Feedback Moderation</h4>
                                        <p className="text-sm text-slate-500">Review user feedback</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="animate-fade-up">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black font-display text-white mb-2">Staff Dashboard</h1>
                <p className="text-slate-400">Platform operations and user support management</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={idx}
                            onClick={() => setActiveView(stat.view)}
                            className={`bg-bg-card border border-slate-800 rounded-3xl p-6 transition-all hover:-translate-y-1 duration-300 cursor-pointer ${activeView === stat.view ? 'border-primary shadow-[0_0_30px_rgba(236,72,153,0.3)]' : 'hover:border-primary/50'
                                }`}
                        >
                            <div className={`${stat.bgColor} w-14 h-14 rounded-2xl flex items-center justify-center mb-4`}>
                                <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                            </div>
                            <div className={`text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${stat.color} mb-2`}>
                                {isLoading ? '...' : stat.value}
                            </div>
                            <div className="text-slate-400 text-sm font-bold">{stat.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* View Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-800 pb-2 overflow-x-auto">
                {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'inquiries', label: 'Inquiries' },
                    { id: 'fundraisers', label: 'Fundraisers' },
                    { id: 'content', label: 'Content' },
                    { id: 'feedback', label: 'Feedback' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveView(tab.id)}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeView === tab.id
                            ? 'bg-primary text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {renderContent()}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
