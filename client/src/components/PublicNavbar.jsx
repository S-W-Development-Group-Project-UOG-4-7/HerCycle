import { Link, NavLink } from 'react-router-dom';
import HeartLogo from './HeartLogo';

export default function PublicNavbar({ user, onLogout }) {
  const linkClass = ({ isActive }) =>
    isActive
      ? "text-primary font-bold drop-shadow-[0_0_8px_rgba(236,72,153,0.4)] transition-all"
      : "text-slate-400 hover:text-primary hover:drop-shadow-[0_0_5px_rgba(236,72,153,0.2)] font-medium transition-all";
  return (
    <nav className="flex justify-between items-center py-5 px-8 md:px-16 bg-bg-dark/80 backdrop-blur-xl border-b border-purple-800/30 sticky top-0 z-50">

      <Link to="/" className="flex items-center gap-3 group"><HeartLogo className="w-10 h-10 group-hover:animate-[heartbeat_1.5s_ease-in-out_infinite]" /><span className="text-3xl font-black font-display bg-clip-text text-transparent bg-[image:var(--neon-gradient)] tracking-tighter">HerCycle</span></Link>

      <div className="hidden md:flex gap-10">
        <NavLink to="/" className={linkClass}>Home</NavLink>
        <NavLink to="/about" className={linkClass}>Mission</NavLink>
      </div>

      <div className="flex gap-4">
        {user ? (
          // Logged in - show Dashboard and Logout
          <>
            <Link to="/dashboard" className="px-6 py-2 rounded-full font-bold text-purple-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <button
              onClick={onLogout}
              className="bg-red-500/80 hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold transition-all"
            >
              Logout
            </button>
          </>
        ) : (
          // Not logged in - show Login and Sign Up
          <>
            <Link to="/login" className="px-6 py-2 rounded-full font-bold text-purple-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/signup" className="bg-secondary hover:bg-secondary-dark text-white px-6 py-2 rounded-full font-bold transition-all shadow-[0_0_15px_rgba(183,148,246,0.5)] hover:shadow-[0_0_25px_rgba(183,148,246,0.7)]">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
