import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Calendar, ArrowRight, Loader2, Sparkles, Shield } from 'lucide-react';
import HeartLogo from './HeartLogo';

export default function Register({ onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await onRegister(name, email, password, dob);
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-bg-dark overflow-hidden relative">

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-[float_6s_ease-in-out_infinite]"></div>
      </div>

      {/* LEFT SIDE - GLASSMORPHIC FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-y-auto">

        <div className="w-full max-w-md animate-fade-up relative z-10 py-10">

          {/* Glassmorphic Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-secondary/10 relative overflow-hidden">

            {/* Card Glow Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-pink-500 to-primary"></div>
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>

            <div className="mb-8 relative">
              <h2 className="text-4xl font-black text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                Create Account
              </h2>
              <p className="text-slate-400">Join our community and start your journey.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name Input */}
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
                  <User size={14} className="text-primary" />
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-slate-800/70 transition-all duration-300 backdrop-blur-sm group-hover:border-slate-600"
                    placeholder="Your name"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              {/* Email Input */}
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
                  <Mail size={14} className="text-secondary" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-secondary focus:bg-slate-800/70 transition-all duration-300 backdrop-blur-sm group-hover:border-slate-600"
                    placeholder="your@email.com"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary/0 via-secondary/5 to-secondary/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
                  <Lock size={14} className="text-primary" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-slate-800/70 transition-all duration-300 backdrop-blur-sm group-hover:border-slate-600"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              {/* Date of Birth Input */}
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
                  <Calendar size={14} className="text-secondary" />
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-secondary focus:bg-slate-800/70 transition-all duration-300 backdrop-blur-sm group-hover:border-slate-600"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary/0 via-secondary/5 to-secondary/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              {/* Submit Button - Futuristic */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full bg-gradient-to-r from-secondary to-primary hover:from-secondary-dark hover:to-primary-dark text-white font-bold py-4 rounded-2xl transition-all duration-300 overflow-hidden shadow-lg shadow-secondary/30 hover:shadow-secondary/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {/* Button Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900/50 text-slate-500 backdrop-blur-sm">Already have an account?</span>
                </div>
              </div>

              {/* Sign In Link */}
              <Link
                to="/login"
                className="block text-center text-slate-400 hover:text-secondary transition-colors group"
              >
                <span className="font-medium">Sign in instead</span>
                <ArrowRight size={16} className="inline ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </form>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FUTURISTIC VISUAL */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-bl from-purple-950 via-pink-950 to-purple-900 items-center justify-center overflow-hidden">

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(183,148,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(183,148,246,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-secondary/40 rounded-full blur-2xl animate-[float_4s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-10 left-20 w-40 h-40 bg-primary/40 rounded-full blur-2xl animate-[float_5s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/3 left-10 w-24 h-24 bg-pink-400/30 rounded-full blur-xl animate-[float_6s_ease-in-out_infinite]"></div>

        <div className="relative z-10 p-12 max-w-lg text-right">
          {/* Animated Logo */}
          <div className="mb-8 flex justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-secondary/30 rounded-full blur-xl animate-pulse"></div>
              <HeartLogo className="w-20 h-20 relative animate-[heartbeat_2s_ease-in-out_infinite]" />
            </div>
          </div>

          <h1 className="text-6xl font-black font-display text-transparent bg-clip-text bg-gradient-to-l from-secondary via-pink-400 to-primary mb-6 leading-tight animate-[gentle-sway_4s_ease-in-out_infinite]">
            Join the Movement.
          </h1>
          <p className="text-slate-200 text-lg leading-relaxed mb-6">
            Become part of a community dedicated to health education, empowerment, and breaking barriers. Your journey starts here.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 justify-end">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
              <Shield size={16} className="text-secondary" />
              <span className="text-sm text-white font-medium">Private</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
              <Sparkles size={16} className="text-primary" />
              <span className="text-sm text-white font-medium">Free Forever</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
