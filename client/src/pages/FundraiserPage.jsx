import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Users, Globe, TrendingUp, ChevronRight, Sparkles, CheckCircle, Lock, ArrowRight, Star, Target } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import HeartLogo from '../components/HeartLogo';
import CampaignCard from '../components/fundraiser/CampaignCard';
import DonationModal from '../components/fundraiser/DonationModal';

export default function FundraiserPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [stats, setStats] = useState({ totalCampaigns: 0, totalDonors: 0, totalRaised: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [showDonationModal, setShowDonationModal] = useState(false);

    const fetchCampaigns = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/fundraiser/campaigns');
            const data = await response.json();
            setCampaigns(data);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/fundraiser/stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns();
        fetchStats();
    }, [fetchCampaigns, fetchStats]);

    const handleDonateClick = (campaign) => {
        setSelectedCampaign(campaign);
        setShowDonationModal(true);
    };

    const handleDonationSuccess = () => {
        fetchCampaigns();
        fetchStats();
    };

    return (
        <div className="min-h-screen bg-bg-dark font-sans">
            <PublicNavbar />

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-20 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-pink-500/20 border border-pink-500/30 rounded-full px-4 py-2 mb-6 animate-fade-up">
                            <Heart size={16} className="text-pink-400 animate-pulse" />
                            <span className="text-pink-300 text-sm font-bold">Support Women's Health</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black mb-6 animate-fade-up delay-100">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-purple-200">
                                Make a Difference
                            </span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400">
                                Today
                            </span>
                        </h1>

                        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-up delay-200">
                            Your donation helps provide menstrual health education, supplies, and support
                            to thousands of women and girls around the world.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-300">
                            <a href="#campaigns" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold px-8 py-4 rounded-full hover:shadow-lg hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2 group">
                                Browse Campaigns
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </a>
                            <Link to="/donor-login" className="border border-slate-700 bg-slate-900/50 text-white font-bold px-8 py-4 rounded-full hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                Donor Login
                            </Link>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-800/50 backdrop-blur-md rounded-3xl p-6 border border-slate-700/50 animate-fade-up delay-300">
                        {[
                            { label: 'Total Raised', value: `$${stats.totalRaised?.toLocaleString() || '0'}`, icon: TrendingUp, color: 'text-green-400' },
                            { label: 'Active Campaigns', value: stats.totalCampaigns || '0', icon: Target, color: 'text-purple-400' },
                            { label: 'Generous Donors', value: stats.totalDonors || '0', icon: Users, color: 'text-pink-400' },
                            { label: 'Countries Reached', value: '25+', icon: Globe, color: 'text-blue-400' }
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center group cursor-default">
                                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                                <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TRUST BADGES */}
            <section className="py-12 border-y border-slate-800/50 bg-slate-900/30">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-wrap justify-center gap-8">
                        {[
                            { icon: Shield, label: 'Secure Payments', desc: '256-bit SSL encryption' },
                            { icon: CheckCircle, label: 'Verified Campaigns', desc: 'Thoroughly vetted' },
                            { icon: Lock, label: 'Privacy Protected', desc: 'Your data is safe' },
                            { icon: Star, label: 'Transparent', desc: '100% fund tracking' }
                        ].map((badge, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-center group">
                                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                                    <badge.icon className="w-6 h-6 text-pink-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-bold text-sm">{badge.label}</p>
                                    <p className="text-slate-500 text-xs">{badge.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CAMPAIGNS SECTION */}
            <section id="campaigns" className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black text-white mb-4">Active Campaigns</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Choose a campaign that resonates with you and help us make a lasting impact.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-pink-500/30 border-t-pink-500 animate-spin" />
                                <Heart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-400 w-6 h-6" />
                            </div>
                        </div>
                    ) : campaigns.length === 0 ? (
                        <div className="text-center py-20">
                            <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No active campaigns</h3>
                            <p className="text-slate-400">Check back soon for new fundraising opportunities!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {campaigns.map((campaign, index) => (
                                <div key={campaign._id} className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                                    <CampaignCard
                                        campaign={campaign}
                                        onDonate={() => handleDonateClick(campaign)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* IMPACT SECTION */}
            <section className="py-20 bg-gradient-to-b from-slate-900/50 to-bg-dark px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-black text-white mb-6">
                                Your Impact <span className="text-pink-400">Matters</span>
                            </h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                Every donation, no matter the size, contributes to providing menstrual health education,
                                supplies, and dignity to women and girls who need it most. Together, we're breaking taboos
                                and building healthier communities.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { amount: '$10', impact: 'Provides menstrual supplies for one month' },
                                    { amount: '$50', impact: 'Funds educational materials for a classroom' },
                                    { amount: '$100', impact: 'Supports a community health workshop' },
                                    { amount: '$500', impact: 'Establishes a school supply station' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                        <div className="bg-pink-500/20 text-pink-400 font-bold px-4 py-2 rounded-lg">
                                            {item.amount}
                                        </div>
                                        <p className="text-slate-300">{item.impact}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-3xl p-8 border border-pink-500/20">
                                <div className="text-center">
                                    <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/30">
                                        <Heart className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-2">Ready to Help?</h3>
                                    <p className="text-slate-400 mb-6">Your generosity changes lives.</p>
                                    <a href="#campaigns" className="inline-flex items-center gap-2 bg-white text-pink-600 font-bold px-8 py-4 rounded-full hover:bg-pink-50 transition-colors">
                                        Donate Now <ArrowRight size={20} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-slate-800 py-12 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <HeartLogo className="w-10 h-10" />
                        <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                            HerCycle Fundraiser
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        © 2026 HerCycle. All donations are secure and protected.
                    </p>
                </div>
            </footer>

            {/* DONATION MODAL */}
            {showDonationModal && selectedCampaign && (
                <DonationModal
                    campaign={selectedCampaign}
                    onClose={() => {
                        setShowDonationModal(false);
                        setSelectedCampaign(null);
                    }}
                    onSuccess={handleDonationSuccess}
                />
            )}
        </div>
    );
}
