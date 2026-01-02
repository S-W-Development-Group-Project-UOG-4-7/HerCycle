import { useState, useEffect } from 'react';
import { Search, UserCircle, Mail, BookOpen, Trash2, Calendar } from 'lucide-react';

export default function LecturersTable({ showToast }) {
    const [lecturers, setLecturers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLecturers();
    }, []);

    const fetchLecturers = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/admin/lecturers');
            const data = await response.json();
            setLecturers(data);
        } catch (error) {
            console.error('Error fetching lecturers:', error);
            showToast('Failed to load lecturers data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteLecturer = async (lecturerId, lecturerName) => {
        if (window.confirm(`Are you sure you want to delete lecturer "${lecturerName}"?`)) {
            try {
                await fetch(`http://localhost:5000/api/users/${lecturerId}`, {
                    method: 'DELETE'
                });
                showToast(`Lecturer "${lecturerName}" deleted successfully`, 'success');
                fetchLecturers(); // Refresh list
            } catch (error) {
                console.error('Error deleting lecturer:', error);
                showToast('Failed to delete lecturer', 'error');
            }
        }
    };

    const calculateAge = (dobString) => {
        if (!dobString) return 'N/A';
        const birthday = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - birthday.getFullYear();
        const m = today.getMonth() - birthday.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) { age--; }
        return age;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filteredLecturers = lecturers.filter(lecturer =>
        lecturer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lecturer.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="bg-bg-card border border-slate-800 rounded-3xl p-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-purple-300">Loading lecturers data...</p>
            </div>
        );
    }

    return (
        <div className="bg-bg-card border border-slate-800 rounded-3xl p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-white">Lecturers</h3>
                    <p className="text-slate-400 text-sm">{lecturers.length} total lecturers</p>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search lecturers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-bg-input border border-purple-500/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-purple-400/50 focus:outline-none focus:border-secondary/50 transition-colors"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-800">
                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lecturer</th>
                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Age</th>
                            <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Courses Created</th>
                            <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                            <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLecturers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-12 text-slate-400">
                                    {searchQuery ? 'No lecturers found' : 'No lecturers yet'}
                                </td>
                            </tr>
                        ) : (
                            filteredLecturers.map((lecturer) => (
                                <tr key={lecturer.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                    {/* Lecturer Info */}
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            {lecturer.profilePic ? (
                                                <img src={lecturer.profilePic} alt={lecturer.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                                                    <UserCircle className="w-6 h-6 text-purple-400" />
                                                </div>
                                            )}
                                            <span className="text-white font-bold">{lecturer.name}</span>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <Mail size={14} />
                                            {lecturer.email}
                                        </div>
                                    </td>

                                    {/* Age */}
                                    <td className="py-4 px-4 text-center text-white">
                                        {calculateAge(lecturer.dob)} yrs
                                    </td>

                                    {/* Courses Created */}
                                    <td className="py-4 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <BookOpen size={16} className="text-secondary" />
                                            <span className="text-white font-bold">{lecturer.coursesCreated}</span>
                                        </div>
                                    </td>

                                    {/* Joined Date */}
                                    <td className="py-4 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                                            <Calendar size={14} />
                                            {formatDate(lecturer.createdAt)}
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="py-4 px-4 text-center">
                                        <button
                                            onClick={() => handleDeleteLecturer(lecturer.id, lecturer.name)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                                            title="Delete lecturer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
