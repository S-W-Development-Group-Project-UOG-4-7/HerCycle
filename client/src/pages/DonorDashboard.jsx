import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Download, Calendar, ChevronRight, LogOut, Trophy, TrendingUp, Receipt, Bell, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import HeartLogo from '../components/HeartLogo';

export default function DonorDashboard() {
    const navigate = useNavigate();
    const [donor, setDonor] = useState(null);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if donor is logged in
        const storedDonor = localStorage.getItem('donor');
        if (!storedDonor) {
            navigate('/donor-login');
            return;
        }
        setDonor(JSON.parse(storedDonor));
    }, [navigate]);

    const fetchDonations = useCallback(async () => {
        if (!donor?.id) return;
        try {
            const response = await fetch(`http://localhost:5000/api/donors/${donor.id}/donations`);
            const data = await response.json();
            setDonations(data);
        } catch (error) {
            console.error('Error fetching donations:', error);
        } finally {
            setLoading(false);
        }
    }, [donor?.id]);

    useEffect(() => {
        fetchDonations();
    }, [fetchDonations]);

    const handleLogout = () => {
        localStorage.removeItem('donor');
        localStorage.removeItem('donorToken');
        navigate('/fundraiser');
    };

    const handleDownloadReceipt = async (donationId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/fundraiser/receipt/${donationId}`);
            const data = await response.json();

            // Create a simple text receipt for download
            const receiptContent = `
========================================
        HERCYCLE DONATION RECEIPT
========================================

Receipt Number: ${data.receiptNumber}
Transaction Ref: ${data.transactionRef}
Date: ${new Date(data.date).toLocaleDateString()}

DONOR DETAILS:
Name: ${data.donorName}
Email: ${data.donorEmail}

DONATION DETAILS:
Campaign: ${data.campaignTitle}
Amount: $${data.amount} ${data.currency}
Payment Method: ${data.paymentMethod}

========================================
Thank you for your generous donation!
Your support makes a difference.
========================================
`;

            // Create blob and download
            const blob = new Blob([receiptContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${data.receiptNumber}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading receipt:', error);
        }
    };

    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

    if (!donor) return null;

    return (
        <div className="min-h-screen bg-bg-dark font-sans">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/fundraiser" className="flex items-center gap-3 group">
                        <HeartLogo className="w-10 h-10 group-hover:animate-pulse" />
                        <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                            HerCycle Donor
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/fundraiser" className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                            Browse Campaigns <ExternalLink size={14} />
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors"
                        >
                            <LogOut size={18} />
                            <span className="text-sm">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl p-8 mb-8 border border-pink-500/20">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-white mb-2">
                                Welcome back, <span className="text-pink-400">{donor.name}</span>! 💝
                            </h1>
                            <p className="text-slate-400">
                                Thank you for being part of our community of generous donors.
                            </p>
                        </div>
                        <Link
                            to="/fundraiser"
                            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all flex items-center gap-2"
                        >
                            <Heart size={18} />
                            Make Another Donation
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm">Total Donated</p>
                                <p className="text-2xl font-black text-white">${totalDonated.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                                <Heart className="w-6 h-6 text-pink-400" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm">Donations Made</p>
                                <p className="text-2xl font-black text-white">{donations.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm">Donor Since</p>
                                <p className="text-2xl font-black text-white">
                                    {donor.createdAt ? new Date(donor.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Today'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Donation History */}
                <div className="bg-slate-800/50 rounded-3xl border border-slate-700/50 overflow-hidden">
                    <div className="p-6 border-b border-slate-700/50">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <Receipt className="text-pink-400" />
                            Donation History
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto" />
                        </div>
                    ) : donations.length === 0 ? (
                        <div className="p-12 text-center">
                            <Heart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No donations yet</h3>
                            <p className="text-slate-400 mb-6">Make your first donation to see it here!</p>
                            <Link
                                to="/fundraiser"
                                className="inline-flex items-center gap-2 bg-pink-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-pink-600 transition-colors"
                            >
                                Browse Campaigns <ChevronRight size={18} />
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700/50">
                            {donations.map((donation) => (
                                <div key={donation._id} className="p-6 hover:bg-slate-800/30 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 bg-gradient-to-br ${donation.campaignId?.color || 'from-pink-500 to-rose-500'} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                                                {donation.campaignId?.icon || '💝'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{donation.campaignTitle}</h3>
                                                <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {new Date(donation.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {new Date(donation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-green-400">${donation.amount}</p>
                                                <div className="flex items-center gap-1 text-green-400 text-xs">
                                                    <CheckCircle size={12} />
                                                    Completed
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownloadReceipt(donation._id)}
                                                className="w-10 h-10 bg-slate-700 hover:bg-pink-500 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
                                                title="Download Receipt"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    {donation.message && (
                                        <div className="mt-4 pl-18 ml-18">
                                            <p className="text-sm text-slate-500 italic bg-slate-800/50 inline-block px-3 py-1 rounded-lg">
                                                "{donation.message}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Campaign Updates Section (Placeholder) */}
                <div className="mt-8 bg-slate-800/50 rounded-3xl border border-slate-700/50 p-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
                        <Bell className="text-purple-400" />
                        Campaign Updates
                    </h2>
                    <p className="text-slate-400 text-center py-8">
                        Updates from campaigns you've supported will appear here.
                    </p>
                </div>
            </main>
        </div>
    );
}
