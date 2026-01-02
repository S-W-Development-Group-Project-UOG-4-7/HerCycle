import { useState, useEffect, useCallback } from 'react';
import { Trophy, Flame, Star, Zap, Target, Award, ChevronLeft, Crown, Medal, Sparkles, TrendingUp, BookOpen } from 'lucide-react';

// Level configurations
const LEVELS = [
    { level: 1, title: 'Curious Learner', xp: 0, color: 'from-slate-400 to-slate-500' },
    { level: 2, title: 'Knowledge Seeker', xp: 100, color: 'from-green-400 to-emerald-500' },
    { level: 3, title: 'Rising Star', xp: 250, color: 'from-blue-400 to-cyan-500' },
    { level: 4, title: 'Smart Cookie', xp: 500, color: 'from-purple-400 to-violet-500' },
    { level: 5, title: 'Brain Power', xp: 800, color: 'from-pink-400 to-rose-500' },
    { level: 6, title: 'Super Scholar', xp: 1200, color: 'from-amber-400 to-orange-500' },
    { level: 7, title: 'Wisdom Warrior', xp: 1700, color: 'from-red-400 to-rose-600' },
    { level: 8, title: 'Master Mind', xp: 2300, color: 'from-indigo-400 to-purple-600' },
    { level: 9, title: 'Legend', xp: 3000, color: 'from-yellow-400 to-amber-500' },
    { level: 10, title: 'Champion', xp: 4000, color: 'from-yellow-300 via-amber-400 to-orange-500' }
];

// Achievement Badge Component with 3D effect
function AchievementBadge3D({ achievement, isUnlocked }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative group cursor-pointer"
            style={{ perspective: '500px' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`
          relative w-24 h-28 rounded-2xl flex flex-col items-center justify-center
          transition-all duration-500 ease-out
          ${isUnlocked
                        ? 'bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 shadow-lg shadow-yellow-500/30'
                        : 'bg-slate-800 border border-slate-700'
                    }
        `}
                style={{
                    transform: isHovered && isUnlocked
                        ? 'rotateY(10deg) rotateX(-10deg) scale(1.1)'
                        : 'rotateY(0) rotateX(0) scale(1)',
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* Icon */}
                <div className={`text-4xl mb-2 ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                </div>

                {/* Lock overlay */}
                {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-2xl">
                        <span className="text-2xl">🔒</span>
                    </div>
                )}

                {/* Shine effect for unlocked */}
                {isUnlocked && isHovered && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-2xl animate-shine" />
                )}
            </div>

            {/* Label */}
            <p className={`text-center text-xs font-bold mt-2 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                {achievement.name}
            </p>
        </div>
    );
}

// Circular Progress Ring
function CircularProgress({ percent, size = 120, strokeWidth = 10, children }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                />
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}

// Leaderboard Item
function LeaderboardItem({ entry, rank, isCurrentUser }) {
    const getRankIcon = () => {
        if (rank === 1) return <Crown className="text-yellow-400 w-6 h-6" />;
        if (rank === 2) return <Medal className="text-slate-300 w-5 h-5" />;
        if (rank === 3) return <Medal className="text-amber-600 w-5 h-5" />;
        return <span className="text-slate-500 font-bold">#{rank}</span>;
    };

    return (
        <div className={`
      flex items-center gap-4 p-4 rounded-2xl transition-all duration-300
      ${isCurrentUser
                ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/50'
                : 'bg-slate-800/50 hover:bg-slate-800'
            }
    `}>
            <div className="w-10 h-10 flex items-center justify-center">
                {getRankIcon()}
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                {entry.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1">
                <p className={`font-bold ${isCurrentUser ? 'text-purple-300' : 'text-white'}`}>
                    {entry.name} {isCurrentUser && '(You)'}
                </p>
                <p className="text-slate-500 text-sm">Level {entry.level} · {entry.levelTitle}</p>
            </div>
            <div className="text-right">
                <p className="text-lg font-bold text-yellow-400 flex items-center gap-1">
                    <Zap size={16} /> {entry.totalXP}
                </p>
                <p className="text-xs text-slate-500">{entry.lessonsCompleted} lessons</p>
            </div>
        </div>
    );
}

// Main Progress Dashboard
export default function BeginnerProgressDashboard({ user, onBack }) {
    const [progress, setProgress] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [allAchievements, setAllAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProgress = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/beginner/progress/${user.id}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching progress:', error);
            return null;
        }
    }, [user.id]);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/beginner/leaderboard?limit=10');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
    }, []);

    const fetchAchievements = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/beginner/achievements');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching achievements:', error);
            return [];
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            const [progressData, leaderboardData, achievementsData] = await Promise.all([
                fetchProgress(),
                fetchLeaderboard(),
                fetchAchievements()
            ]);

            if (isMounted) {
                setProgress(progressData);
                setLeaderboard(leaderboardData);
                setAllAchievements(achievementsData);
                setLoading(false);
            }
        };

        loadData();

        return () => { isMounted = false; };
    }, [fetchProgress, fetchLeaderboard, fetchAchievements]);

    const currentLevel = LEVELS.find(l => l.level === (progress?.level || 1)) || LEVELS[0];
    const unlockedAchievementIds = progress?.achievements?.map(a => a.id) || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                    <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-400 w-8 h-8" />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-up">
            {/* Floating Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-20 right-20 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-blob" />
                <div className="absolute bottom-40 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500">
                            🏆 My Progress
                        </h1>
                        <p className="text-slate-400">Track your learning journey!</p>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Level Card */}
                    <div className={`col-span-1 lg:col-span-2 bg-gradient-to-br ${currentLevel.color} rounded-3xl p-8 relative overflow-hidden`}>
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative flex items-center gap-8">
                            <CircularProgress percent={progress?.levelProgress || 0} size={140} strokeWidth={12}>
                                <div className="text-center">
                                    <span className="text-5xl font-black text-white">{progress?.level || 1}</span>
                                    <p className="text-white/70 text-xs uppercase tracking-wider">Level</p>
                                </div>
                            </CircularProgress>

                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">{currentLevel.title}</h2>
                                <div className="flex items-center gap-4 text-white/80">
                                    <span className="flex items-center gap-1">
                                        <Zap size={18} className="text-yellow-300" />
                                        {progress?.totalXP || 0} XP Total
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Target size={18} />
                                        {progress?.xpInCurrentLevel || 0} / {progress?.xpNeededForLevel || 100} to next
                                    </span>
                                </div>

                                {/* Mini level progress */}
                                <div className="mt-4 flex items-center gap-2">
                                    {LEVELS.slice(0, 5).map(l => (
                                        <div
                                            key={l.level}
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${l.level <= (progress?.level || 1)
                                                    ? 'bg-white text-purple-600'
                                                    : 'bg-white/20 text-white/50'
                                                }
                      `}
                                        >
                                            {l.level}
                                        </div>
                                    ))}
                                    <span className="text-white/50">...</span>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${(progress?.level || 1) >= 10 ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 text-white/50'
                                        }`}>
                                        10
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="space-y-4">
                        {/* Streak */}
                        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 text-8xl opacity-20">🔥</div>
                            <div className="relative">
                                <Flame className="text-white/80 w-8 h-8 mb-2" />
                                <p className="text-4xl font-black text-white">{progress?.currentStreak || 0}</p>
                                <p className="text-white/70 text-sm">Day Streak</p>
                                <p className="text-white/50 text-xs mt-1">Best: {progress?.longestStreak || 0} days</p>
                            </div>
                        </div>

                        {/* Lessons Completed */}
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 text-8xl opacity-20">📚</div>
                            <div className="relative">
                                <BookOpen className="text-white/80 w-8 h-8 mb-2" />
                                <p className="text-4xl font-black text-white">{progress?.totalLessonsCompleted || 0}</p>
                                <p className="text-white/70 text-sm">Lessons Done</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievements Section */}
                <div className="bg-slate-800/50 rounded-3xl p-8 mb-8 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-6">
                        <Award className="text-yellow-400 w-8 h-8" />
                        <h3 className="text-2xl font-bold text-white">Achievements</h3>
                        <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold">
                            {unlockedAchievementIds.length} / {allAchievements.length}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {allAchievements.map(achievement => (
                            <AchievementBadge3D
                                key={achievement.id}
                                achievement={achievement}
                                isUnlocked={unlockedAchievementIds.includes(achievement.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-purple-400 w-8 h-8" />
                        <h3 className="text-2xl font-bold text-white">Leaderboard</h3>
                        <Sparkles className="text-purple-400 w-5 h-5 animate-pulse" />
                    </div>

                    <div className="space-y-3">
                        {leaderboard.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">Complete lessons to appear on the leaderboard!</p>
                        ) : (
                            leaderboard.map((entry, index) => (
                                <LeaderboardItem
                                    key={index}
                                    entry={entry}
                                    rank={entry.rank}
                                    isCurrentUser={entry.name === user.name}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes shine {
          from { opacity: 0; transform: translateX(-100%); }
          to { opacity: 1; transform: translateX(100%); }
        }
        .animate-blob { animation: blob 7s ease-in-out infinite; }
        .animate-shine { animation: shine 0.6s ease-out; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
        </div>
    );
}
