import { useState, useEffect } from 'react';
import { Sparkles, Star, Zap, Flame, Trophy, Rocket, Heart, PartyPopper } from 'lucide-react';

// Animated Mascot Character (Friendly Owl)
function MascotOwl({ message, isWaving }) {
    return (
        <div className="relative inline-block animate-float">
            {/* Speech Bubble */}
            {message && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-slate-800 px-4 py-2 rounded-2xl shadow-lg text-sm font-bold whitespace-nowrap animate-bounce-in z-10">
                    {message}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45" />
                </div>
            )}
            {/* Owl Body */}
            <div className={`relative text-7xl transition-transform duration-300 ${isWaving ? 'animate-wiggle' : ''}`}>
                🦉
            </div>
        </div>
    );
}

// Floating Decorations Component
function FloatingDecorations() {
    const decorations = [
        { emoji: '⭐', delay: 0, duration: 8, x: 5, size: 'text-2xl' },
        { emoji: '✨', delay: 1, duration: 6, x: 15, size: 'text-xl' },
        { emoji: '💫', delay: 2, duration: 10, x: 25, size: 'text-2xl' },
        { emoji: '🌟', delay: 0.5, duration: 7, x: 35, size: 'text-3xl' },
        { emoji: '💖', delay: 3, duration: 9, x: 45, size: 'text-xl' },
        { emoji: '🎈', delay: 1.5, duration: 11, x: 55, size: 'text-2xl' },
        { emoji: '🦋', delay: 2.5, duration: 8, x: 65, size: 'text-xl' },
        { emoji: '🌈', delay: 0.8, duration: 12, x: 75, size: 'text-2xl' },
        { emoji: '⭐', delay: 3.5, duration: 7, x: 85, size: 'text-xl' },
        { emoji: '✨', delay: 4, duration: 9, x: 92, size: 'text-2xl' },
    ];

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {decorations.map((d, i) => (
                <div
                    key={i}
                    className={`absolute ${d.size} animate-float-around opacity-60`}
                    style={{
                        left: `${d.x}%`,
                        top: `${10 + (i % 5) * 15}%`,
                        animationDelay: `${d.delay}s`,
                        animationDuration: `${d.duration}s`,
                    }}
                >
                    {d.emoji}
                </div>
            ))}
        </div>
    );
}

// Fun Streak Fire Animation
function StreakFire({ streak }) {
    if (streak < 1) return null;

    const fireSize = Math.min(streak, 7);
    const fires = Array(fireSize).fill('🔥');

    return (
        <div className="flex items-center gap-0.5">
            {fires.map((_, i) => (
                <span
                    key={i}
                    className="animate-bounce-slow"
                    style={{
                        animationDelay: `${i * 0.1}s`,
                        fontSize: `${1.2 + (i * 0.1)}rem`
                    }}
                >
                    🔥
                </span>
            ))}
        </div>
    );
}

// Daily Motivation Messages
const MOTIVATIONS = [
    { emoji: '🚀', text: "You're a superstar learner!" },
    { emoji: '🌟', text: "Ready for an amazing adventure?" },
    { emoji: '💪', text: "You've got this, champion!" },
    { emoji: '🎯', text: "Let's learn something amazing today!" },
    { emoji: '🦸', text: "Time to be a learning superhero!" },
    { emoji: '🎨', text: "Your brain is ready for fun!" },
    { emoji: '🏆', text: "Every lesson makes you stronger!" },
    { emoji: '🌈', text: "Awesome things await you today!" },
];

// Main Welcome Component
export default function BeginnerWelcome({ user, progress, onContinue }) {
    const [showMascotMessage, setShowMascotMessage] = useState(false);

    const dailyMotivation = MOTIVATIONS[new Date().getDate() % MOTIVATIONS.length];
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
    const firstName = user?.name?.split(' ')[0] || 'Friend';

    useEffect(() => {
        const timer = setTimeout(() => setShowMascotMessage(true), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden">
            {/* Floating Decorations */}
            <FloatingDecorations />

            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-blob" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute top-1/3 right-0 w-72 h-72 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center px-4 animate-fade-up">
                {/* Mascot */}
                <div className="mb-6">
                    <MascotOwl
                        message={showMascotMessage ? `Hey ${firstName}! 👋` : null}
                        isWaving={showMascotMessage}
                    />
                </div>

                {/* Rainbow Gradient Text */}
                <h1 className="text-4xl md:text-6xl font-black mb-3 animate-rainbow-text">
                    {greeting}, {firstName}!
                </h1>

                {/* Motivational Message */}
                <div className="flex items-center justify-center gap-2 text-xl md:text-2xl text-white/80 mb-8">
                    <span className="text-3xl animate-bounce">{dailyMotivation.emoji}</span>
                    <span>{dailyMotivation.text}</span>
                </div>

                {/* Stats Cards */}
                <div className="flex flex-wrap justify-center gap-4 mb-10">
                    {/* XP Card */}
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 min-w-[140px] transform hover:scale-105 transition-all duration-300 shadow-lg shadow-yellow-500/30">
                        <Zap className="w-8 h-8 text-white mx-auto mb-1" />
                        <p className="text-3xl font-black text-white">{progress?.totalXP || 0}</p>
                        <p className="text-white/80 text-sm font-bold">Total XP</p>
                    </div>

                    {/* Streak Card */}
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 min-w-[140px] transform hover:scale-105 transition-all duration-300 shadow-lg shadow-orange-500/30">
                        <div className="flex justify-center mb-1">
                            <StreakFire streak={progress?.currentStreak || 0} />
                        </div>
                        <p className="text-3xl font-black text-white">{progress?.currentStreak || 0}</p>
                        <p className="text-white/80 text-sm font-bold">Day Streak</p>
                    </div>

                    {/* Level Card */}
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 min-w-[140px] transform hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/30">
                        <Trophy className="w-8 h-8 text-white mx-auto mb-1" />
                        <p className="text-3xl font-black text-white">Lvl {progress?.level || 1}</p>
                        <p className="text-white/80 text-sm font-bold">{progress?.levelTitle || 'Learner'}</p>
                    </div>
                </div>

                {/* Continue Button */}
                <button
                    onClick={onContinue}
                    className="group relative bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white font-black text-xl px-10 py-5 rounded-full shadow-2xl shadow-purple-500/40 hover:shadow-pink-500/50 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-pulse-glow"
                >
                    <span className="flex items-center gap-3">
                        <Rocket className="w-6 h-6 group-hover:animate-bounce" />
                        Start Learning!
                        <Sparkles className="w-6 h-6 animate-pulse" />
                    </span>

                    {/* Button Sparkles */}
                    <div className="absolute -top-1 -right-1 text-xl animate-ping">✨</div>
                    <div className="absolute -bottom-1 -left-1 text-xl animate-ping animation-delay-1000">⭐</div>
                </button>

                {/* Fun Tip */}
                <p className="mt-8 text-slate-400 text-sm flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400 animate-heartbeat" />
                    Complete lessons to earn XP and unlock achievements!
                    <Heart className="w-4 h-4 text-pink-400 animate-heartbeat" />
                </p>
            </div>

            {/* CSS for special animations */}
            <style jsx>{`
                .animate-rainbow-text {
                    background: linear-gradient(90deg, #ff6ec7, #b794f6, #06b6d4, #22c55e, #eab308, #ff6ec7);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: rainbow-shift 3s linear infinite;
                }
                @keyframes rainbow-shift {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.5); }
                    50% { box-shadow: 0 0 40px rgba(236, 72, 153, 0.6); }
                }
                .animate-heartbeat {
                    animation: heartbeat 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
