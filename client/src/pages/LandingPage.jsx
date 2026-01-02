import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, BookOpen, ChevronRight, Sparkles, Users, Globe, Award, ArrowRight, Instagram, Twitter, Facebook } from 'lucide-react';
import { useState } from 'react';
import HeartLogo from '../components/HeartLogo';
import ReviewSection from '../components/ReviewSection';

// Floating Elements Component
const FloatingElements = () => {
    // Initialize elements directly instead of using useEffect to avoid cascading renders
    const [elements] = useState(() => {
        const newElements = [];

        // Create sparkles
        for (let i = 0; i < 15; i++) {
            newElements.push({
                id: `sparkle-${i}`,
                type: 'sparkle',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                delay: `${Math.random() * 3}s`,
                duration: `${3 + Math.random() * 2}s`
            });
        }

        // Create flowers
        for (let i = 0; i < 10; i++) {
            newElements.push({
                id: `flower-${i}`,
                type: 'flower',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                delay: `${Math.random() * 4}s`,
                duration: `${4 + Math.random() * 2}s`
            });
        }

        return newElements;
    });

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {elements.map((el) => (
                <div
                    key={el.id}
                    className="absolute"
                    style={{
                        top: el.top,
                        left: el.left,
                        animationDelay: el.delay,
                        animationDuration: el.duration,
                    }}
                >
                    {el.type === 'sparkle' && (
                        <div className="w-2 h-2 bg-gradient-to-br from-primary to-secondary rounded-full animate-[sparkle_3s_infinite]" />
                    )}
                    {el.type === 'flower' && (
                        <div className="w-4 h-4 bg-gradient-to-br from-pink-400 to-primary rounded-full animate-[float_4s_infinite_ease-in-out]" />
                    )}
                </div>
            ))}
        </div>
    );
};


export default function LandingPage({ user }) {
    return (
        <div className="min-h-screen bg-bg-dark selection:bg-primary selection:text-white overflow-x-hidden font-sans relative">

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden mesh-gradient">

                {/* Floating Animated Elements */}
                <FloatingElements />

                {/* Enhanced Animated Background Glows with pulse animation */}
                <div className="glow-orb top-0 left-1/4 w-[600px] h-[600px] bg-primary/20 pointer-events-none"></div>
                <div className="glow-orb bottom-20 right-1/4 w-[500px] h-[500px] bg-secondary/20 animation-delay-2000 pointer-events-none"></div>
                <div className="glow-orb top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-500/10 animation-delay-4000 pointer-events-none"></div>

                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm rounded-full px-4 py-1.5 mb-8 animate-fade-up hover:bg-slate-800 transition-colors cursor-default hover:scale-105">
                        <Sparkles size={14} className="text-primary animate-pulse" />
                        <span className="text-xs font-bold text-primary tracking-widest uppercase">Empowering Women Worldwide</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black font-display mb-8 tracking-tight animate-fade-up delay-100 leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 inline-block animate-[gentle-sway_6s_infinite_ease-in-out]">
                            Your Body,
                        </span>
                        <br />
                        <span className="bg-clip-text text-transparent bg-[image:var(--neon-gradient)] inline-block animate-[gentle-sway_6s_infinite_ease-in-out] delay-300">
                            Your Rules.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-up delay-200">
                        A safe sanctuary for learning about <span className="text-white font-semibold">Menstrual Health</span>, <span className="text-white font-semibold">Consent</span>, and <span className="text-white font-semibold">Safety</span>. Join a community that cares.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-up delay-300">
                        <Link to="/login" className="group bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all transform hover:-translate-y-1 flex items-center gap-3 animate-[bounce-gentle_2s_infinite]">
                            Start Learning
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/signup" className="group border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-full transition-all hover:border-slate-500 flex items-center gap-3 hover:scale-105">
                            Join Community
                            <Users size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="py-10 border-y border-slate-800/50 bg-slate-900/30 backdrop-blur-sm relative z-20">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: "Active Learners", value: "10k+", icon: Users },
                        { label: "Countries", value: "50+", icon: Globe },
                        { label: "Courses", value: "25+", icon: BookOpen },
                        { label: "Certificates", value: "5k+", icon: Award },
                    ].map((stat, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 group cursor-default transform hover:scale-110 transition-transform">
                            <stat.icon className="w-6 h-6 text-slate-500 group-hover:text-primary transition-colors mb-1 animate-[bounce-gentle_2s_infinite]" style={{ animationDelay: `${idx * 0.2}s` }} />
                            <span className="text-3xl font-black text-white">{stat.value}</span>
                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="max-w-7xl mx-auto py-32 px-6 relative z-20">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Everything you need to know.</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        We break down complex topics into simple, easy-to-understand modules. No jargon, no judgment.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="glass-card hover-lift p-8 rounded-3xl border border-slate-800 hover:border-primary/50 transition-all group duration-300 relative overflow-hidden">
                        <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                        <div className="bg-slate-800 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-black/50 group-hover:animate-[bounce-gentle_1s_infinite]">
                            <Heart className="w-7 h-7 text-primary group-hover:text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Menstrual Health</h3>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            Track your cycle with precision. Understand your body's signals, manage symptoms, and learn about hygiene products that work for you.
                        </p>
                        <Link to="/login" className="text-primary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                            Explore Module <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Card 2 */}
                    <div className="glass-card hover-lift p-8 rounded-3xl border border-slate-800 hover:border-secondary/50 transition-all group duration-300 delay-100 relative overflow-hidden">
                        <div className="absolute top-4 right-4 w-3 h-3 bg-secondary rounded-full animate-pulse delay-100"></div>
                        <div className="bg-slate-800 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:-rotate-6 transition-all duration-300 shadow-lg shadow-black/50 group-hover:animate-[bounce-gentle_1s_infinite]">
                            <BookOpen className="w-7 h-7 text-secondary group-hover:text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Sex Education</h3>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            Honest, scientifically accurate information about intercourse, consent, and relationships. Free from stigma and myths.
                        </p>
                        <Link to="/login" className="text-secondary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                            Start Learning <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Card 3 */}
                    <div className="glass-card hover-lift p-8 rounded-3xl border border-slate-800 hover:border-primary/50 transition-all group duration-300 delay-200 relative overflow-hidden">
                        <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full animate-pulse delay-200"></div>
                        <div className="bg-slate-800 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-lg shadow-black/50 group-hover:animate-[bounce-gentle_1s_infinite]">
                            <ShieldCheck className="w-7 h-7 text-primary group-hover:text-slate-900" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Safety & Rights</h3>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            Know your rights. Learn about protection, reporting mechanisms, and how to stay safe in digital and physical spaces.
                        </p>
                        <Link to="/login" className="text-primary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                            Get Informed <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* USER TYPE SELECTION SECTION */}
            <section className="max-w-7xl mx-auto py-20 px-6 relative z-20">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                        <Sparkles size={14} className="text-primary animate-pulse" />
                        <span className="text-xs font-bold text-primary tracking-widest uppercase">Choose Your Path</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Two ways to get started</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Whether you want to learn or track your cycle, HerCycle has you covered.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Student Path */}
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-8 rounded-3xl border border-primary/30 hover:border-primary/60 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                                <BookOpen className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-4">For Students</h3>
                            <p className="text-slate-300 leading-relaxed mb-6">
                                Access comprehensive educational content about menstrual health, reproductive health, and wellness. Perfect for learners of all ages.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-3 text-slate-400">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                                        <ChevronRight size={14} className="text-primary" />
                                    </div>
                                    <span>Interactive learning modules & quizzes</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-400">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                                        <ChevronRight size={14} className="text-primary" />
                                    </div>
                                    <span>Expert-verified educational content</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-400">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                                        <ChevronRight size={14} className="text-primary" />
                                    </div>
                                    <span>Community support & discussions</span>
                                </li>
                            </ul>
                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-primary/30"
                            >
                                Become a Student
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>

                    {/* Cycle User Path */}
                    <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 p-8 rounded-3xl border border-pink-500/30 hover:border-pink-500/60 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                                <Heart className="w-8 h-8 text-pink-400" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-4">For Cycle Trackers</h3>
                            <p className="text-slate-300 leading-relaxed mb-6">
                                Track your menstrual cycle, log symptoms, and get personalized insights. Take control of your reproductive health journey.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-3 text-slate-400">
                                    <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center mt-0.5 shrink-0">
                                        <ChevronRight size={14} className="text-pink-400" />
                                    </div>
                                    <span>Accurate period predictions & reminders</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-400">
                                    <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center mt-0.5 shrink-0">
                                        <ChevronRight size={14} className="text-pink-400" />
                                    </div>
                                    <span>Symptom tracking & health insights</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-400">
                                    <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center mt-0.5 shrink-0">
                                        <ChevronRight size={14} className="text-pink-400" />
                                    </div>
                                    <span>Privacy-first data encryption</span>
                                </li>
                            </ul>
                            <Link
                                to="/signup?type=cycle-user"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold px-8 py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-pink-500/30"
                            >
                                Become a Cycle-User
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* REVIEW SECTION */}
            <ReviewSection user={user} />

            {/* QUOTE SECTION */}
            <section className="py-24 bg-gradient-to-b from-slate-900 to-bg-dark relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <div className="mb-8 text-6xl text-slate-700 font-serif animate-pulse">&#34;</div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        Education is the most powerful weapon which you can use to change the world.
                    </h2>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-12 bg-slate-700 rounded-full overflow-hidden animate-[gentle-sway_4s_infinite_ease-in-out]">
                            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary"></div>
                        </div>
                        <div className="text-left">
                            <div className="text-white font-bold">Nelson Mandela</div>
                            <div className="text-slate-500 text-sm">Inspiration for Change</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="py-20 px-6 relative">
                <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[3rem] p-12 md:p-20 text-center border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-bg-dark/50 backdrop-blur-sm"></div>

                    {/* Floating sparkles in CTA */}
                    <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-[sparkle_2s_infinite]"></div>
                    <div className="absolute top-20 right-20 w-2 h-2 bg-primary rounded-full animate-[sparkle_3s_infinite]"></div>
                    <div className="absolute bottom-10 left-20 w-2 h-2 bg-secondary rounded-full animate-[sparkle_2.5s_infinite]"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 animate-[gentle-sway_5s_infinite_ease-in-out]">Ready to take control?</h2>
                        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                            Join thousands of women who are learning, sharing, and growing together. It's free and private.
                        </p>
                        <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-bg-dark font-bold px-10 py-4 rounded-full hover:bg-slate-200 transition-colors shadow-xl shadow-white/10 hover:scale-105 transform animate-[bounce-gentle_2s_infinite]">
                            Create Free Account <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-purple-800/30 bg-gradient-to-b from-bg-dark to-purple-950/20 pt-20 pb-10 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 mb-16">
                    <div>
                        <Link to="/" className="flex items-center gap-3 mb-6 group">
                            <HeartLogo className="w-12 h-12 group-hover:animate-[heartbeat_1.5s_ease-in-out_infinite]" />
                            <span className="text-3xl font-black font-display bg-clip-text text-transparent bg-[image:var(--neon-gradient)] tracking-tighter">
                                HerCycle
                            </span>
                        </Link>
                        <p className="text-purple-200 max-w-sm leading-relaxed">
                            Empowering women through education, health tracking, and community support. Built with privacy and safety first.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Connect</h4>
                        <div className="flex gap-4 mb-6">
                            <a href="#" className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/20 flex items-center justify-center text-purple-300 hover:bg-primary hover:text-white hover:border-primary transition-all hover:scale-110 hover:animate-[bounce-gentle_1s_infinite]">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/20 flex items-center justify-center text-purple-300 hover:bg-secondary hover:text-white hover:border-secondary transition-all hover:scale-110 hover:animate-[bounce-gentle_1s_infinite]">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/20 flex items-center justify-center text-purple-300 hover:bg-primary hover:text-white hover:border-primary transition-all hover:scale-110 hover:animate-[bounce-gentle_1s_infinite]">
                                <Facebook size={20} />
                            </a>
                        </div>
                        <p className="text-purple-400 text-sm">
                            © 2025 HerCycle. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

        </div>
    );
}
