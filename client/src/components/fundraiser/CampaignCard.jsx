import { useState } from 'react';
import { Heart, ChevronRight, Users, Calendar, Target, CheckCircle } from 'lucide-react';

export default function CampaignCard({ campaign, onDonate }) {
    const [isHovered, setIsHovered] = useState(false);

    const progressPercent = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));

    // Calculate days remaining
    const now = new Date();
    const endDate = new Date(campaign.endDate);
    const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));

    return (
        <div
            className="relative group cursor-pointer"
            style={{ perspective: '1000px' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`
                    relative bg-slate-800/50 backdrop-blur-md rounded-3xl overflow-hidden
                    border border-slate-700/50 transition-all duration-500
                    ${isHovered ? 'shadow-2xl shadow-pink-500/20 border-pink-500/30' : ''}
                `}
                style={{
                    transform: isHovered ? 'translateY(-8px) rotateX(2deg)' : 'translateY(0) rotateX(0)',
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* Header with gradient background */}
                <div className={`relative h-40 bg-gradient-to-br ${campaign.color || 'from-pink-500 to-rose-500'} p-6 overflow-hidden`}>
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4" />

                    {/* Icon and badges */}
                    <div className="relative flex justify-between items-start">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform">
                            {campaign.icon || '💝'}
                        </div>

                        {/* Trust badges */}
                        <div className="flex gap-2">
                            {campaign.trustBadges?.includes('verified') && (
                                <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle size={12} className="text-white" />
                                    <span className="text-white text-xs font-bold">Verified</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Days remaining badge */}
                    <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                        <Calendar size={12} className="text-white/80" />
                        <span className="text-white text-xs font-bold">
                            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Ended'}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-pink-300 transition-colors">
                        {campaign.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                        {campaign.description}
                    </p>

                    {/* Progress bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white font-bold">${campaign.raisedAmount?.toLocaleString()}</span>
                            <span className="text-slate-500">of ${campaign.goalAmount?.toLocaleString()}</span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${campaign.color || 'from-pink-500 to-rose-500'} rounded-full transition-all duration-1000 relative`}
                                style={{ width: `${progressPercent}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>{progressPercent}% funded</span>
                            <span className="flex items-center gap-1">
                                <Users size={10} /> {campaign.totalDonors || 0} donors
                            </span>
                        </div>
                    </div>

                    {/* Impact stats (mini) */}
                    {campaign.impactStats && (
                        <div className="flex gap-4 mb-4 text-xs">
                            <div className="flex items-center gap-1 text-slate-400">
                                <Heart size={12} className="text-pink-400" />
                                {campaign.impactStats.beneficiaries || 0} helped
                            </div>
                            <div className="flex items-center gap-1 text-slate-400">
                                <Target size={12} className="text-purple-400" />
                                {campaign.impactStats.regionsReached || 0} regions
                            </div>
                        </div>
                    )}

                    {/* Donate button */}
                    <button
                        onClick={onDonate}
                        className={`
                            w-full bg-gradient-to-r ${campaign.color || 'from-pink-500 to-rose-500'} 
                            text-white font-bold py-3 rounded-xl
                            flex items-center justify-center gap-2
                            hover:shadow-lg hover:shadow-pink-500/30 
                            transition-all transform hover:scale-[1.02]
                        `}
                    >
                        <Heart size={18} />
                        Donate Now
                        <ChevronRight size={18} className={`transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
    );
}
