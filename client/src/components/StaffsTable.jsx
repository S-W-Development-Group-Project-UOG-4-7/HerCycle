import { useState, useEffect } from 'react';
import { Search, UserCircle, Mail, Trash2, Calendar, Shield } from 'lucide-react';

export default function StaffsTable({ showToast }) {
    const [staffs, setStaffs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStaffs();
    }, []);

    const fetchStaffs = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/admin/staffs');
            const data = await response.json();
            setStaffs(data);
        } catch (error) {
            console.error('Error fetching staffs:', error);
            showToast('Failed to load staffs data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteStaff = async (staffId, staffName) => {
        if (window.confirm(`Are you sure you want to delete staff member "${staffName}"?`)) {
            try {
                await fetch(`http://localhost:5000/api/users/${staffId}`, {
                    method: 'DELETE'
                });
                showToast(`Staff "${staffName}" deleted successfully`, 'success');
                fetchStaffs(); // Refresh list
            } catch (error) {
                console.error('Error deleting staff:', error);
                showToast('Failed to delete staff', 'error');
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

    const filteredStaffs = staffs.filter(staff =>
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="bg-bg-card border border-slate-800 rounded-3xl p-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-teal-300">Loading staffs data...</p>
            </div>
        );
    }

    return (
        <div className="bg-bg-card border border-slate-800 rounded-3xl p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-white">Staff Members</h3>
                    <p className="text-slate-400 text-sm">{staffs.length} total staff members</p>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search staff..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-bg-input border border-teal-500/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-teal-400/50 focus:outline-none focus:border-teal-500/50 transition-colors"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-800">
                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Staff</th>
                            <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Age</th>
                            <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                            <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaffs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-12 text-slate-400">
                                    {searchQuery ? 'No staff found' : 'No staff members yet'}
                                </td>
                            </tr>
                        ) : (
                            filteredStaffs.map((staff) => (
                                <tr key={staff.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                    {/* Staff Info */}
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            {staff.profilePic ? (
                                                <img src={staff.profilePic} alt={staff.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
                                                    <UserCircle className="w-6 h-6 text-teal-400" />
                                                </div>
                                            )}
                                            <span className="text-white font-bold">{staff.name}</span>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <Mail size={14} />
                                            {staff.email}
                                        </div>
                                    </td>

                                    {/* Age */}
                                    <td className="py-4 px-4 text-center text-white">
                                        {calculateAge(staff.dob)} yrs
                                    </td>

                                    {/* Role */}
                                    <td className="py-4 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Shield size={16} className="text-teal-400" />
                                            <span className="text-teal-400 font-bold capitalize">Staff</span>
                                        </div>
                                    </td>

                                    {/* Joined Date */}
                                    <td className="py-4 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                                            <Calendar size={14} />
                                            {formatDate(staff.createdAt)}
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="py-4 px-4 text-center">
                                        <button
                                            onClick={() => handleDeleteStaff(staff.id, staff.name)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                                            title="Delete staff"
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
