import { useState } from 'react';
import { UserPlus, Mail, Lock, User as UserIcon, Calendar } from 'lucide-react';

export default function CreateLecturerForm({ onSuccess, showToast }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        dob: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/admin/create-lecturer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showToast(`Lecturer "${data.lecturer.name}" created successfully!`, 'success');
                setFormData({ name: '', email: '', password: '', dob: '' });
                if (onSuccess) onSuccess(data.lecturer);
            } else {
                showToast(data.message || 'Failed to create lecturer', 'error');
            }
        } catch (error) {
            console.error('Error creating lecturer:', error);
            showToast('Something went wrong', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-bg-card border border-slate-800 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-secondary/10 p-3 rounded-2xl">
                    <UserPlus className="w-6 h-6 text-secondary" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white">Create Lecturer Account</h3>
                    <p className="text-slate-400 text-sm">Add a new lecturer to the platform</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                    <label className="block text-purple-200 font-bold mb-2 text-sm flex items-center gap-2">
                        <UserIcon size={16} className="text-secondary" />
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter lecturer's full name"
                        className="w-full bg-bg-input border border-purple-500/20 rounded-xl px-4 py-3 text-white placeholder-purple-400/50 focus:outline-none focus:border-secondary/50 transition-colors"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-purple-200 font-bold mb-2 text-sm flex items-center gap-2">
                        <Mail size={16} className="text-secondary" />
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="lecturer@example.com"
                        className="w-full bg-bg-input border border-purple-500/20 rounded-xl px-4 py-3 text-white placeholder-purple-400/50 focus:outline-none focus:border-secondary/50 transition-colors"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-purple-200 font-bold mb-2 text-sm flex items-center gap-2">
                        <Lock size={16} className="text-secondary" />
                        Temporary Password
                    </label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={4}
                        placeholder="Min. 4 characters"
                        className="w-full bg-bg-input border border-purple-500/20 rounded-xl px-4 py-3 text-white placeholder-purple-400/50 focus:outline-none focus:border-secondary/50 transition-colors"
                    />
                    <p className="text-xs text-slate-500 mt-1">Lecturer should change this after first login</p>
                </div>

                {/* Date of Birth */}
                <div>
                    <label className="block text-purple-200 font-bold mb-2 text-sm flex items-center gap-2">
                        <Calendar size={16} className="text-secondary" />
                        Date of Birth (Optional)
                    </label>
                    <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full bg-bg-input border border-purple-500/20 rounded-xl px-4 py-3 text-white placeholder-purple-400/50 focus:outline-none focus:border-secondary/50 transition-colors"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-bold px-6 py-4 rounded-full shadow-[0_0_20px_rgba(183,148,246,0.4)] hover:shadow-[0_0_30px_rgba(183,148,246,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin w-5 h-5 border-3 border-white border-t-transparent rounded-full" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <UserPlus size={20} />
                            Create Lecturer Account
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
