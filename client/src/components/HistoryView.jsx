import { useState, useEffect, useCallback } from 'react';
import { Download, History, Filter, Search, FileText, Trash2, Edit, Calendar } from 'lucide-react';
import { exportStudentsPDF, exportCoursesPDF, exportModificationsPDF, exportFullHistoryPDF } from '../utils/PDFExport';

export default function HistoryView({ showToast }) {
    const [activeTab, setActiveTab] = useState('all');
    const [history, setHistory] = useState({ users: [], courses: [], modifications: [], studentDeletions: [] });
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    // Define fetchHistory with useCallback
    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/admin/history');
            const data = await response.json();
            setHistory(data);
        } catch (error) {
            console.error('Error fetching history:', error);
            showToast('Failed to load history', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    // Define filterData with useCallback
    const filterData = useCallback(() => {
        let data = [];

        switch (activeTab) {
            case 'students':
                data = history.users.filter(u => u.role === 'student');
                break;
            case 'courses':
                data = history.courses;
                break;
            case 'deletions':
                data = history.studentDeletions;
                break;
            default: // 'all'
                data = [
                    ...history.studentDeletions.map(d => ({ ...d, type: 'studentDeletion' })),
                    ...history.courses.map(c => ({ ...c, type: 'course' })),
                    ...history.users.filter(u => u.role === 'student').map(u => ({ ...u, type: 'student' }))
                ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        if (searchTerm) {
            data = data.filter(item =>
                JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredData(data);
    }, [activeTab, searchTerm, history]);

    // Fetch history data on component mount
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Real-time polling - refresh every 5 seconds for new deletions
    useEffect(() => {
        const interval = setInterval(() => {
            fetchHistory();
        }, 5000);
        return () => clearInterval(interval);
    }, [fetchHistory]);

    // Filter data when dependencies change
    useEffect(() => {
        filterData();
    }, [filterData]);

    const handleExport = async (type) => {
        setExporting(true);
        let success = false;

        try {
            switch (type) {
                case 'students':
                    success = await exportStudentsPDF();
                    break;
                case 'courses':
                    success = await exportCoursesPDF();
                    break;
                case 'modifications':
                    success = await exportModificationsPDF();
                    break;
                case 'full':
                    success = await exportFullHistoryPDF();
                    break;
            }

            if (success) {
                showToast('PDF exported successfully!', 'success');
            } else {
                showToast('Failed to export PDF', 'error');
            }
        } catch (error) {
            console.error('Export error:', error);
            showToast('Failed to export PDF', 'error');
        } finally {
            setExporting(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="animate-fade-up">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                    <History className="text-primary" />
                    Platform History
                </h1>
                <p className="text-slate-400">Complete activity log and downloadable reports</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-bg-card border border-slate-800 rounded-3xl p-6">
                    <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500 mb-2">
                        {history.users.filter(u => u.role === 'student').length}
                    </div>
                    <div className="text-slate-400 text-sm font-bold">Total Students</div>
                </div>
                <div className="bg-bg-card border border-slate-800 rounded-3xl p-6">
                    <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500 mb-2">
                        {history.courses.length}
                    </div>
                    <div className="text-slate-400 text-sm font-bold">Total Courses</div>
                </div>
                <div className={`bg-bg-card border rounded-3xl p-6 transition-all duration-500 ${history.studentDeletions?.some(d => !d.notificationRead)
                    ? 'border-red-500 shadow-lg shadow-red-500/30 animate-pulse'
                    : 'border-slate-800'
                    }`}>
                    <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-rose-500 mb-2">
                        {history.studentDeletions?.length || 0}
                    </div>
                    <div className="text-slate-400 text-sm font-bold">Deleted Students</div>
                </div>
                <div className="bg-bg-card border border-slate-800 rounded-3xl p-6">
                    <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 mb-2">
                        {history.users.filter(u => u.role === 'lecturer').length}
                    </div>
                    <div className="text-slate-400 text-sm font-bold">Total Lecturers</div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-bg-card border border-slate-800 rounded-3xl p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Tabs */}
                    <div className="flex gap-2">
                        {[
                            { id: 'all', label: 'All Activity' },
                            { id: 'students', label: 'Students' },
                            { id: 'courses', label: 'Courses' },
                            { id: 'deletions', label: 'Student Deletions' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px - 4 py - 2 rounded - xl font - bold text - sm transition - all ${activeTab === tab.id
                                    ? 'bg-primary text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    } `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Export Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleExport(activeTab === 'all' ? 'full' : activeTab)}
                            disabled={exporting}
                            className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            <Download size={16} />
                            {exporting ? 'Exporting...' : 'Export PDF'}
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="mt-4 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search history..."
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
            </div>

            {/* Data Display */}
            <div className="bg-bg-card border border-slate-800 rounded-3xl p-6">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                        <p className="text-slate-400 mt-4">Loading history...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="text-slate-600 mx-auto mb-4" size={48} />
                        <p className="text-slate-500">No data found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {activeTab === 'deletions' || (activeTab === 'all' && filteredData.some(d => d.type === 'studentDeletion')) ? (
                            // Student Deletions View
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Date</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Student Name</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Student Email</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Deleted By</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.filter(d => !d.type || d.type === 'studentDeletion').map((deletion, idx) => (
                                        <tr
                                            key={idx}
                                            className={`border-b border-slate-800/50 hover:bg-slate-800/20 transition-all ${!deletion.notificationRead
                                                    ? 'bg-red-500/10 border-l-4 border-l-red-500 animate-pulse'
                                                    : ''
                                                }`}
                                        >
                                            <td className="py-4 px-4 text-slate-400 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {formatDate(deletion.createdAt)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-white font-bold">{deletion.studentName}</td>
                                            <td className="py-4 px-4 text-slate-400">{deletion.studentEmail}</td>
                                            <td className="py-4 px-4 text-orange-400 font-medium">{deletion.lecturerName}</td>
                                            <td className="py-4 px-4 text-slate-400 text-sm max-w-xs truncate">{deletion.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : activeTab === 'students' ? (
                            // Students View
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Name</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Email</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Joined</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Courses Completed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((student, idx) => (
                                        <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                            <td className="py-4 px-4 text-white font-bold">{student.name}</td>
                                            <td className="py-4 px-4 text-slate-400">{student.email}</td>
                                            <td className="py-4 px-4 text-slate-400 text-sm">{formatDate(student.createdAt)}</td>
                                            <td className="py-4 px-4 text-white">{student.completedCourses?.length || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : activeTab === 'courses' ? (
                            // Courses View
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Title</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Instructor</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Creator</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Topic</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((course, idx) => (
                                        <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                            <td className="py-4 px-4 text-white font-bold">{course.title}</td>
                                            <td className="py-4 px-4 text-slate-400">{course.instructor}</td>
                                            <td className="py-4 px-4 text-slate-400">{course.createdBy?.name || 'Unknown'}</td>
                                            <td className="py-4 px-4">
                                                <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs font-bold">
                                                    {course.topic}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-slate-400 text-sm">{formatDate(course.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : activeTab === 'deletions' ? (
                            // Student Deletions View
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Date</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Student Name</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Student Email</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Deleted By</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((deletion, idx) => (
                                        <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                            <td className="py-4 px-4 text-slate-400 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {formatDate(deletion.createdAt)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-white font-bold">{deletion.studentName}</td>
                                            <td className="py-4 px-4 text-slate-400">{deletion.studentEmail}</td>
                                            <td className="py-4 px-4 text-orange-400 font-medium">{deletion.lecturerName}</td>
                                            <td className="py-4 px-4 text-slate-400 text-sm max-w-xs truncate">{deletion.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            // All Activity Timeline View
                            <div className="space-y-4">
                                {filteredData.slice(0, 50).map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 bg-slate-800/20 rounded-2xl hover:bg-slate-800/40 transition-colors">
                                        <div className={`w - 12 h - 12 rounded - xl flex items - center justify - center ${item.type === 'modification' ? 'bg-orange-500/20' :
                                            item.type === 'studentDeletion' ? 'bg-red-500/20' :
                                                item.type === 'course' ? 'bg-green-500/20' :
                                                    'bg-blue-500/20'
                                            } `}>
                                            {item.type === 'modification' ? <Edit className="text-orange-400" size={20} /> :
                                                item.type === 'studentDeletion' ? <Trash2 className="text-red-400" size={20} /> :
                                                    item.type === 'course' ? <FileText className="text-green-400" size={20} /> :
                                                        <FileText className="text-blue-400" size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-white font-bold">
                                                        {item.type === 'modification' ? `Course ${item.action}: ${item.courseTitle} ` :
                                                            item.type === 'studentDeletion' ? `Student Deleted: ${item.studentName} ` :
                                                                item.type === 'course' ? `Course Created: ${item.title} ` :
                                                                    `Student Joined: ${item.name} `}
                                                    </p>
                                                    <p className="text-slate-400 text-sm mt-1">
                                                        {item.type === 'modification' ? `By ${item.modifierName} - ${item.reason} ` :
                                                            item.type === 'studentDeletion' ? `By ${item.lecturerName} - ${item.reason} ` :
                                                                item.type === 'course' ? `By ${item.createdBy?.name || 'Unknown'} ` :
                                                                    item.email}
                                                    </p>
                                                </div>
                                                <span className="text-slate-500 text-xs">{formatDate(item.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
