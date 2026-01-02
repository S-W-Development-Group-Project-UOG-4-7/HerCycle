import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Mail, Lock, ArrowRight, Loader } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import HeartLogo from '../components/HeartLogo';

export default function DonorLogin() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/donors/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            localStorage.setItem('donorToken', data.token);
            localStorage.setItem('donor', JSON.stringify(data.donor));
            navigate('/donor-dashboard');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark font-sans">
            <PublicNavbar />

            <div className="flex items-center justify-center min-h-screen pt-20 px-6">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link to="/fundraiser" className="inline-flex items-center gap-3 group">
                            <HeartLogo className="w-14 h-14 group-hover:animate-pulse" />
                            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                                Donor Portal
                            </span>
                        </Link>
                    </div>

                    {/* Login Card */}
                    <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-8 border border-slate-700/50">
                        <h1 className="text-2xl font-bold text-white text-center mb-2">Welcome Back</h1>
                        <p className="text-slate-400 text-center mb-8">Sign in to view your donation history</p>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                                <p className="text-red-300 text-sm text-center">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="email@example.com"
                                        className="w-full bg-slate-900 text-white pl-12 pr-4 py-3 rounded-xl border border-slate-700 focus:border-pink-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="Your password"
                                        className="w-full bg-slate-900 text-white pl-12 pr-4 py-3 rounded-xl border border-slate-700 focus:border-pink-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
                            >
                                {loading ? (
                                    <Loader className="animate-spin w-5 h-5" />
                                ) : (
                                    <>
                                        Sign In <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
                            <p className="text-slate-400 text-sm">
                                Don't have an account?{' '}
                                <Link to="/fundraiser" className="text-pink-400 font-bold hover:underline">
                                    Make your first donation
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Back link */}
                    <div className="text-center mt-6">
                        <Link to="/fundraiser" className="text-slate-500 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors">
                            <Heart size={14} />
                            Back to Fundraiser
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
