import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import StaffDashboard from './StaffDashboard';
import Toast from '../components/Toast';
import { UserCircle, Menu } from 'lucide-react';

export default function StaffDashboardWrapper({ user, onLogout }) {
    const [activeView, setActiveView] = useState('overview');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    return (
        <div className="flex min-h-screen bg-bg-dark font-sans overflow-hidden">
            <Sidebar
                user={user}
                activeTab={activeView}
                setActiveTab={setActiveView}
                onLogout={onLogout}
                isMobileOpen={isMobileSidebarOpen}
                setIsMobileOpen={setIsMobileSidebarOpen}
            />
            <main className="flex-1 h-screen overflow-y-auto relative scroll-smooth">
                <header className="sticky top-0 z-30 bg-bg-dark/80 backdrop-blur-md px-4 md:px-8 py-5 flex justify-between items-center border-b border-slate-800">
                    <button
                        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                        className="md:hidden text-white hover:text-primary transition-colors p-2"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="text-right hidden sm:block">
                            <p className="text-white font-bold font-display">{user.name}</p>
                            <p className="text-primary text-xs font-bold uppercase tracking-wider">{user.role}</p>
                        </div>
                        <div className="bg-slate-800 p-1 rounded-full border border-slate-700 shadow-lg overflow-hidden w-12 h-12">
                            {user.profilePic ? (
                                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <UserCircle className="text-slate-300 w-8 h-8" />
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <div className="p-8 max-w-7xl mx-auto pb-20">
                    <StaffDashboard user={user} showToast={showToast} onLogout={onLogout} />
                </div>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </main>
        </div>
    );
}
