import { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, Activity } from 'lucide-react';
import CreateLecturerForm from '../components/CreateLecturerForm';
import StudentsProgressTable from '../components/StudentsProgressTable';
import LecturersTable from '../components/LecturersTable';

export default function AdminDashboard({ showToast }) {
    const [analytics, setAnalytics] = useState({
        totalStudents: 0,
        totalLecturers: 0,
        totalCourses: 0,
        totalUsers: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [activeView, setActiveView] = useState('overview'); // overview, students, lecturers, courses

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/admin/analytics');
            const data = await response.json();
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            showToast('Failed to load analytics', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const stats = [
        {
            label: 'Total Students',
            value: analytics.totalStudents,
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            iconColor: 'text-blue-400',
            view: 'students'
        },
        {
            label: 'Total Lecturers',
            value: analytics.totalLecturers,
            icon: GraduationCap,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            iconColor: 'text-purple-400',
            view: 'lecturers'
        },
        {
            label: 'Total Courses',
            value: analytics.totalCourses,
            icon: BookOpen,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            iconColor: 'text-green-400',
            view: 'courses'
        },
        {
            label: 'Active Users',
            value: analytics.totalUsers,
            icon: Activity,
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-500/10',
            iconColor: 'text-orange-400',
            view: 'overview'
        }
    ];

    const renderContent = () => {
        switch (activeView) {
            case 'students':
                return <StudentsProgressTable showToast={showToast} />;

            case 'lecturers':
                return <LecturersTable showToast={showToast} />;

            case 'courses':
                return (
                    <div className="bg-bg-card border border-slate-800 rounded-3xl p-8">
                        <h3 className="text-2xl font-bold text-white mb-4">All Courses</h3>
                        <p className="text-slate-400">
                            Total courses on platform: <span className="text-white font-bold">{analytics.totalCourses}</span>
                        </p>
                        <p className="text-slate-500 text-sm mt-2">
                            Click "All Courses" in the sidebar to view and manage all courses
                        </p>
                    </div>
                );

            default: // overview
                return (
                    <>
                        {/* Create Lecturer Form */}
                        <div className="mb-8">
                            <CreateLecturerForm
                                showToast={showToast}
                                onSuccess={() => fetchAnalytics()}
                            />
                        </div>

                        {/* Quick Links */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-bg-card border border-slate-800 rounded-3xl p-6 hover:border-primary/50 transition-all cursor-pointer" onClick={() => setActiveView('students')}>
                                <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    <Users className="text-blue-400" size={20} />
                                    View All Students
                                </h4>
                                <p className="text-slate-400 text-sm">See student progress and analytics</p>
                            </div>

                            <div className="bg-bg-card border border-slate-800 rounded-3xl p-6 hover:border-secondary/50 transition-all cursor-pointer" onClick={() => setActiveView('lecturers')}>
                                <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    <GraduationCap className="text-purple-400" size={20} />
                                    View All Lecturers
                                </h4>
                                <p className="text-slate-400 text-sm">Manage lecturer accounts</p>
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
                <h1 className="text-4xl font-black font-display text-white mb-2">Admin Dashboard</h1>
                <p className="text-slate-400">Manage platform users and monitor analytics</p>
            </div>

            {/* Stats Cards - Now Clickable */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => {
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
            <div className="flex gap-2 mb-6 border-b border-slate-800 pb-2">
                {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'students', label: 'Students' },
                    { id: 'lecturers', label: 'Lecturers' },
                    { id: 'courses', label: 'Courses' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveView(tab.id)}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeView === tab.id
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
        </div>
    );
}
