import { useState, useEffect } from 'react';
import { Search, UserCircle, Mail, TrendingUp, Trash2 } from 'lucide-react';

export default function StudentsProgressTable({ showToast }) {
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/admin/students-progress');
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
            showToast('Failed to load students data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteStudent = async (studentId, studentName) => {
        if (window.confirm(`Are you sure you want to delete ${studentName}'s account?`)) {
            try {
                await fetch(`http://localhost:5000/api/users/${studentId}`, {
                    method: 'DELETE'
                });
                showToast(`Student "${studentName}" deleted successfully`, 'success');
                fetchStudents(); // Refresh list
            } catch (error) {
                console.error('Error deleting student:', error);
                showToast('Failed to delete student', 'error');
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

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="bg-bg-card border border-slate-800 rounded-3xl p-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-purple-300">Loading students data...</p>
            </div>
        );
    }

    return (
        <div className="bg-bg-card border border-slate-800 rounded-3xl p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-white">Students Progress</h3>
                    <p className="text-slate-400 text-sm">{students.length} total students</p>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-bg-input border border-purple-500/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-purple-400/50 focus:outline-none focus:border-secondary/50 transition-colors"
                    />
                </div>
            </div>

            {/* Desktop Table - Hidden on mobile */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="border-b border-slate-800">
                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Age</th>
                            <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</th>
                            <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</th>
                            <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-12 text-slate-400">
                                    {searchQuery ? 'No students found' : 'No students yet'}
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student) => (
                                <tr key={student.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            {student.profilePic ? (
                                                <img src={student.profilePic} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                                                    <UserCircle className="w-6 h-6 text-slate-400" />
                                                </div>
                                            )}
                                            <span className="text-white font-bold">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <Mail size={14} />
                                            {student.email}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center text-white">
                                        {calculateAge(student.dob)} yrs
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <span className="text-white font-bold">{student.completedCount}</span>
                                        <span className="text-slate-500 text-sm">/{student.totalCourses}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500"
                                                    style={{ width: `${student.progressPercentage}%` }}
                                                />
                                            </div>
                                            <span className="text-white font-bold text-sm min-w-[3rem] text-right">
                                                {student.progressPercentage}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <button
                                            onClick={() => handleDeleteStudent(student.id, student.name)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                                            title="Delete student"
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

            {/* Mobile Cards - Shown on small screens */}
            <div className="md:hidden space-y-4">
                {filteredStudents.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        {searchQuery ? 'No students found' : 'No students yet'}
                    </div>
                ) : (
                    filteredStudents.map((student) => (
                        <div key={student.id} className="bg-slate-800/30 border border-slate-700 rounded-2xl p-4">
                            {/* Student Header */}
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700">
                                {student.profilePic ? (
                                    <img src={student.profilePic} alt={student.name} className="w-14 h-14 rounded-full object-cover" />
                                ) : (
                                    <div className="w-14 h-14 bg-slate-700 rounded-full flex items-center justify-center">
                                        <UserCircle className="w-8 h-8 text-slate-400" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="text-white font-bold text-lg">{student.name}</h4>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                                        <Mail size={12} />
                                        {student.email}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteStudent(student.id, student.name)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                                    title="Delete student"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Student Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Age</p>
                                    <p className="text-white font-bold">{calculateAge(student.dob)} yrs</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Completed</p>
                                    <p className="text-white font-bold">
                                        {student.completedCount}<span className="text-slate-500 text-sm">/{student.totalCourses}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-slate-500 text-xs uppercase tracking-wider">Progress</p>
                                    <p className="text-white font-bold text-sm">{student.progressPercentage}%</p>
                                </div>
                                <div className="bg-slate-700 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500"
                                        style={{ width: `${student.progressPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
