import { Heart, Users, BookOpen, Target, Sparkles, Award, Globe, Zap } from 'lucide-react';
import HeartLogo from '../components/HeartLogo';
import { useEffect, useState } from 'react';
import missionHeroImg from '../assets/mission_hero.png';
import empowermentImg from '../assets/empowerment.png';

export default function AboutPage() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const values = [
        {
            icon: Heart,
            title: 'Compassion',
            description: 'Creating a safe, judgment-free space for everyone',
            color: 'from-pink-500 to-rose-500'
        },
        {
            icon: BookOpen,
            title: 'Education',
            description: 'Empowering through knowledge and understanding',
            color: 'from-purple-500 to-indigo-500'
        },
        {
            icon: Globe,
            title: 'Inclusivity',
            description: 'Breaking barriers and stigmas together',
            color: 'from-cyan-500 to-blue-500'
        },
        {
            icon: Zap,
            title: 'Innovation',
            description: 'Modern solutions for modern health education',
            color: 'from-yellow-500 to-orange-500'
        }
    ];

    const stats = [
        { value: '10K+', label: 'Active Students', icon: Users },
        { value: '500+', label: 'Courses', icon: BookOpen },
        { value: '95%', label: 'Success Rate', icon: Award },
        { value: '24/7', label: 'Support', icon: Heart }
    ];

    return (
        <div className="min-h-screen bg-bg-dark overflow-hidden">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"
                    style={{ transform: `translateY(${scrollY * 0.3}px)` }}
                />
                <div
                    className="absolute bottom-20 left-10 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse"
                    style={{ transform: `translateY(${-scrollY * 0.2}px)` }}
                />
                <div
                    className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl"
                    style={{ transform: `translate(-50%, -50%) translateY(${scrollY * 0.1}px)` }}
                />
            </div>

            {/* Hero Section with Parallax */}
            <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-secondary/30" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        {/* Animated Logo */}
                        <div
                            className="flex justify-center mb-8"
                            style={{ transform: `scale(${1 + scrollY * 0.0005})` }}
                        >
                            <div className="relative animate-float">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-2xl opacity-50 animate-pulse" />
                                <HeartLogo className="w-24 h-24 relative" />
                            </div>
                        </div>

                        {/* Title with Gradient */}
                        <h1 className="text-6xl md:text-8xl font-black mb-6 animate-fade-up">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-pink-400 to-secondary animate-gradient">
                                Our Mission
                            </span>
                        </h1>

                        <p className="text-2xl md:text-3xl text-slate-300 mb-8 max-w-4xl mx-auto font-light animate-fade-up animation-delay-200">
                            Empowering through education, breaking stigmas, and creating a healthier future
                        </p>

                        {/* Floating Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-16">
                            {stats.map((stat, idx) => {
                                const Icon = stat.icon;
                                return (
                                    <div
                                        key={idx}
                                        className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-primary/50 transition-all hover:-translate-y-2 duration-300 animate-fade-up"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <Icon className="w-8 h-8 text-primary mb-3 mx-auto" />
                                        <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                                        <div className="text-slate-400 text-sm">{stat.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Section with Image */}
            <section className="relative py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        {/* Image Side */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-2 overflow-hidden">
                                <img
                                    src={missionHeroImg}
                                    alt="Mission Visual"
                                    className="w-full h-96 object-cover rounded-2xl"
                                />
                            </div>
                        </div>

                        {/* Content Side */}
                        <div className="space-y-6">
                            <div className="inline-block">
                                <span className="bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-bold">
                                    Our Story
                                </span>
                            </div>
                            <h2 className="text-5xl font-black text-white">
                                Breaking Barriers in <span className="text-primary">Health Education</span>
                            </h2>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                HerCycle was born from a simple yet powerful vision: to create a world where menstrual health education is accessible,
                                comprehensive, and free from stigma. We believe that knowledge is power, and everyone deserves access to quality health education.
                            </p>
                            <p className="text-slate-400 leading-relaxed">
                                Through cutting-edge technology and compassionate teaching, we're transforming how the next generation learns about
                                reproductive health, self-care, and wellness. Our platform combines interactive courses, expert-led content, and a
                                supportive community to create an unparalleled learning experience.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-yellow-400" />
                                    <span className="text-sm text-slate-400">Evidence-Based</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-green-400" />
                                    <span className="text-sm text-slate-400">Expert-Reviewed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section with 3D Cards */}
            <section className="relative py-32 px-6 bg-slate-900/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black text-white mb-6">
                            Our Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Values</span>
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, idx) => {
                            const Icon = value.icon;
                            return (
                                <div
                                    key={idx}
                                    className="group relative"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* 3D Card Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl"
                                        style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                                    />

                                    <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 hover:border-primary/50 transition-all duration-500 hover:-translate-y-4 hover:scale-105">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${value.color} p-0.5 mb-6 group-hover:rotate-12 transition-transform duration-500`}>
                                            <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">{value.title}</h3>
                                        <p className="text-slate-400 leading-relaxed">{value.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Vision Section with Images */}
            <section className="relative py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        {/* Content Side */}
                        <div className="space-y-6 order-2 md:order-1">
                            <div className="inline-block">
                                <span className="bg-secondary/20 text-secondary px-4 py-2 rounded-full text-sm font-bold">
                                    Our Vision
                                </span>
                            </div>
                            <h2 className="text-5xl font-black text-white">
                                A Future Without <span className="text-secondary">Stigma</span>
                            </h2>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                We envision a world where menstrual health is openly discussed, properly understood, and universally supported.
                                Where education breaks down barriers and empowers individuals to take control of their health journey.
                            </p>
                            <div className="grid grid-cols-2 gap-4 pt-6">
                                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-4">
                                    <div className="text-3xl font-black text-primary mb-1">100%</div>
                                    <div className="text-sm text-slate-400">Free Education</div>
                                </div>
                                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-4">
                                    <div className="text-3xl font-black text-secondary mb-1">Global</div>
                                    <div className="text-sm text-slate-400">Accessibility</div>
                                </div>
                            </div>
                        </div>

                        {/* Image Side */}
                        <div className="relative group order-1 md:order-2">
                            <div className="absolute inset-0 bg-gradient-to-l from-secondary to-primary rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-2 overflow-hidden">
                                <img
                                    src={empowermentImg}
                                    alt="Empowerment"
                                    className="w-full h-96 object-cover rounded-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-xl border border-primary/30 rounded-3xl p-12 relative overflow-hidden">
                        {/* Animated Background */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full blur-3xl animate-pulse animation-delay-1000" />
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                                Join Our Mission
                            </h2>
                            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                                Be part of the movement to break stigmas and empower through education
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-lg shadow-primary/30">
                                    Become a Student
                                </button>
                                <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 border border-slate-700">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
