import { useState, useEffect } from 'react';
import { Sparkles, Star, Trophy, Flame, Target, BookOpen, Heart, Shield, Smile, ChevronRight, Lock, Check, Zap } from 'lucide-react';

// Category configurations with colors and icons
const CATEGORIES = [
    { name: 'All', icon: Sparkles, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/20' },
    { name: 'Body Basics', icon: Heart, color: 'from-rose-500 to-pink-500', bg: 'bg-rose-500/20' },
    { name: 'Emotions & Feelings', icon: Smile, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/20' },
    { name: 'Healthy Habits', icon: Zap, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/20' },
    { name: 'Growing Up', icon: Star, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/20' },
    { name: 'Staying Safe', icon: Shield, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/20' }
];

// 3D Card Component with hover animations
function LessonCard3D({ lesson, isCompleted, onSelect, userProgress }) {
    const [isHovered, setIsHovered] = useState(false);
    const categoryConfig = CATEGORIES.find(c => c.name === lesson.category) || CATEGORIES[0];

    const difficultyStars = {
        'easy': 1,
        'medium': 2,
        'hard': 3
    };

    return (
        <div
            className="relative group cursor-pointer"
            style={{ perspective: '1000px' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onSelect(lesson)}
        >
            {/* 3D Card Container */}
            <div
                className={`
          relative w-full h-72 rounded-3xl overflow-hidden
          transition-all duration-500 ease-out
          ${isHovered ? 'shadow-2xl shadow-purple-500/30' : 'shadow-lg'}
        `}
                style={{
                    transform: isHovered
                        ? 'rotateY(-5deg) rotateX(5deg) translateZ(20px) scale(1.02)'
                        : 'rotateY(0) rotateX(0) translateZ(0) scale(1)',
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* Animated Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${categoryConfig.color} opacity-90`}>
                    {/* Floating particles effect */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
                                style={{
                                    left: `${15 + i * 15}%`,
                                    top: `${20 + (i % 3) * 25}%`,
                                    animationDelay: `${i * 0.5}s`,
                                    animationDuration: `${3 + i * 0.5}s`
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Card Content */}
                <div className="relative h-full p-6 flex flex-col justify-between z-10">
                    {/* Top Section */}
                    <div>
                        {/* Icon & Status */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                {lesson.icon || '📚'}
                            </div>

                            {isCompleted ? (
                                <div className="bg-green-400 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-bounce-slow">
                                    <Check size={14} /> Done!
                                </div>
                            ) : (
                                <div className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                                    +{lesson.xpReward} XP
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 drop-shadow-lg">
                            {lesson.title}
                        </h3>

                        {/* Description */}
                        <p className="text-white/80 text-sm line-clamp-2">
                            {lesson.description}
                        </p>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex justify-between items-center">
                        {/* Difficulty Stars */}
                        <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    className={`transition-all duration-300 ${i < difficultyStars[lesson.difficultyLevel]
                                        ? 'text-yellow-300 fill-yellow-300 drop-shadow-glow'
                                        : 'text-white/30'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Play Button */}
                        <div className={`
              w-12 h-12 rounded-full bg-white flex items-center justify-center
              transform transition-all duration-300 shadow-xl
              ${isHovered ? 'scale-110 rotate-12' : ''}
            `}>
                            <ChevronRight className="text-purple-600 w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Shine Effect */}
                <div
                    className={`
            absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent
            transition-opacity duration-500
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
                    style={{
                        transform: 'translateX(-100%)',
                        animation: isHovered ? 'shine 0.8s ease-out forwards' : 'none'
                    }}
                />
            </div>
        </div>
    );
}

// Progress Header Component
function ProgressHeader({ progress, onProgressClick }) {
    const xpPercent = progress?.levelProgress || 0;

    return (
        <div
            onClick={onProgressClick}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-6 mb-8 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
        >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Level Badge */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl">
                            <span className="text-4xl font-black text-white">{progress?.level || 1}</span>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            LVL
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{progress?.levelTitle || 'Curious Learner'}</h2>
                        <p className="text-white/70 text-sm">Keep learning to level up!</p>
                    </div>
                </div>

                {/* XP Progress Bar */}
                <div className="flex-1 max-w-md w-full">
                    <div className="flex justify-between text-sm text-white/80 mb-2">
                        <span className="flex items-center gap-1">
                            <Zap size={14} className="text-yellow-300" /> {progress?.totalXP || 0} XP
                        </span>
                        <span>{progress?.nextLevelXP || 100} XP needed</span>
                    </div>
                    <div className="h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${xpPercent}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-white">
                            <Flame size={20} className="text-orange-400" />
                            <span className="text-2xl font-bold">{progress?.currentStreak || 0}</span>
                        </div>
                        <p className="text-white/70 text-xs">Day Streak</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-white">
                            <Trophy size={20} className="text-yellow-400" />
                            <span className="text-2xl font-bold">{progress?.achievements?.length || 0}</span>
                        </div>
                        <p className="text-white/70 text-xs">Badges</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main Component
export default function BeginnerEducationView({ user, onSelectLesson, onShowProgress }) {
    const [lessons, setLessons] = useState([]);
    const [progress, setProgress] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLessons();
        fetchProgress();
    }, []);

    const fetchLessons = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/beginner/lessons?role=${user.role}&userId=${user.id}`);
            const data = await response.json();
            setLessons(data);
        } catch (error) {
            console.error('Error fetching lessons:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProgress = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/beginner/progress/${user.id}`);
            const data = await response.json();
            setProgress(data);
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    };

    const filteredLessons = selectedCategory === 'All'
        ? lessons
        : lessons.filter(l => l.category === selectedCategory);

    const completedLessonIds = progress?.completedLessons?.map(cl => cl.lessonId?._id || cl.lessonId) || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500 w-8 h-8" />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-up">
            {/* Floating Background Blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
            </div>

            {/* Floating Emoji Decorations */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {['⭐', '✨', '🌟', '💫', '🦋', '🎈', '💖', '🌈'].map((emoji, i) => (
                    <div
                        key={i}
                        className="absolute text-2xl animate-float-around opacity-50"
                        style={{
                            left: `${5 + i * 12}%`,
                            top: `${10 + (i % 4) * 20}%`,
                            animationDelay: `${i * 0.7}s`,
                            animationDuration: `${8 + i}s`
                        }}
                    >
                        {emoji}
                    </div>
                ))}
            </div>

            <div className="relative z-10">
                {/* Kid-Friendly Header with Mascot */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-5xl animate-bounce">🦉</span>
                            <h1 className="text-4xl font-black animate-rainbow-text">
                                Learning Adventure
                            </h1>
                            <span className="text-3xl animate-pulse">🚀</span>
                        </div>
                        <p className="text-slate-400 text-lg flex items-center gap-2">
                            <span className="text-xl">✨</span>
                            Choose a lesson and start earning XP!
                            <span className="text-xl">✨</span>
                        </p>
                    </div>
                    {/* Mini Mascot Tip */}
                    <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 rounded-2xl border border-purple-500/30">
                        <span className="text-2xl animate-wiggle">💡</span>
                        <span className="text-sm text-white/70">Tip: Complete lessons daily!</span>
                    </div>
                </div>

                {/* Progress Header */}
                <ProgressHeader progress={progress} onProgressClick={onShowProgress} />

                {/* Category Pills */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        const isActive = selectedCategory === category.name;
                        return (
                            <button
                                key={category.name}
                                onClick={() => setSelectedCategory(category.name)}
                                className={`
                  flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm
                  transition-all duration-300 transform
                  ${isActive
                                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white hover:scale-102'
                                    }
                `}
                            >
                                <Icon size={18} />
                                {category.name}
                            </button>
                        );
                    })}
                </div>

                {/* Lessons Grid */}
                {filteredLessons.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-bold text-white mb-2">No lessons yet!</h3>
                        <p className="text-slate-400">New lessons are coming soon. Stay tuned!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLessons.map((lesson, index) => (
                            <div
                                key={lesson._id}
                                className="animate-fade-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <LessonCard3D
                                    lesson={lesson}
                                    isCompleted={completedLessonIds.includes(lesson._id)}
                                    onSelect={onSelectLesson}
                                    userProgress={progress}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes shine {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-blob { animation: blob 7s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-bounce-slow { animation: bounce 2s infinite; }
        .drop-shadow-glow { filter: drop-shadow(0 0 4px currentColor); }
      `}</style>
        </div>
    );
}
