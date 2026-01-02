import { LayoutDashboard, UploadCloud, Users, Settings, LogOut, BookOpen, Layers, PenTool, MessageCircle, UserPlus, TrendingUp, Shield, X, History, Sparkles, Trophy, Award, Rocket } from 'lucide-react';
import NotificationBadge from './NotificationBadge';

// Calculate age from DOB
const calculateAge = (dobString) => {
  if (!dobString) return 18; // Default to adult if no DOB
  const birthday = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const m = today.getMonth() - birthday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) { age--; }
  return age;
};

export default function Sidebar({ user, activeTab, setActiveTab, onLogout, isMobileOpen, setIsMobileOpen }) {
  const userAge = calculateAge(user.dob);
  const isBeginnerStudent = user.role === 'student' && userAge < 15;

  // Define menu items based on Role and Age
  const menuItems = user.role === 'admin'
    ? [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'students', label: 'Students Analytics', icon: TrendingUp },
      { id: 'manage-courses', label: 'All Courses', icon: BookOpen },
      { id: 'beginner-manage', label: 'Beginner Lessons', icon: Sparkles },
      { id: 'messages', label: 'Messages', icon: MessageCircle, showBadge: true },
      { id: 'history', label: 'History & Reports', icon: History },
    ]
    : user.role === 'lecturer'
      ? [
        { id: 'upload', label: 'Upload Content', icon: UploadCloud },
        { id: 'beginner-upload', label: 'Beginner Content', icon: Sparkles },
        { id: 'education', label: 'My Content', icon: BookOpen },
        { id: 'topics', label: 'Topics', icon: Layers },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'messages', label: 'Messages', icon: MessageCircle, showBadge: true },
      ]
      : isBeginnerStudent
        ? [
          // BEGINNER STUDENT MENU (Under 15)
          { id: 'beginner-education', label: '🚀 Learn', icon: Rocket },
          { id: 'beginner-progress', label: 'My Progress', icon: Trophy },
          { id: 'beginner-achievements', label: 'Badges', icon: Award },
          { id: 'notes', label: 'My Notes', icon: PenTool },
        ]
        : [
          // ADVANCED STUDENT MENU (15+)
          { id: 'education', label: 'Education', icon: BookOpen },
          { id: 'notes', label: 'My Notes', icon: PenTool },
          { id: 'community', label: 'Community', icon: MessageCircle },
        ];

  // Common items (Settings)
  const commonItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // Close mobile menu after selection
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-bg-card border-r border-slate-800 flex-col h-screen shrink-0 z-50
        fixed md:relative
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        flex
      `}>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-white p-2"
        >
          <X size={24} />
        </button>

        {/* Logo Area */}
        <div className="p-8 pb-4">
          <h1 className="text-3xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tight">
            Hercycle.
          </h1>
          <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">LMS Platform</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Menu</p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-bold text-sm relative ${isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} />
                {item.label}
                {item.showBadge && <NotificationBadge userId={user.id} type="messages" />}
              </button>
            );
          })}

          <div className="pt-6 mt-6 border-t border-slate-800">
            <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Account</p>
            {commonItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-bold text-sm ${isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout Area */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}