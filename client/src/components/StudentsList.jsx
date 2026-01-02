import { useState, useEffect } from 'react';
import { Trash2, User, Search, X } from 'lucide-react';

export default function StudentsList({ showToast }) {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletionModal, setDeletionModal] = useState({
    isOpen: false,
    studentId: null,
    studentName: ''
  });
  const [deletionReason, setDeletionReason] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => setStudents(data));
  }, []);

  const handleRemoveClick = (id, name) => {
    setDeletionModal({ isOpen: true, studentId: id, studentName: name });
    setDeletionReason("");
  };

  const handleConfirmDeletion = async () => {
    if (deletionReason.length < 10) {
      showToast("Reason must be at least 10 characters.", "error");
      return;
    }

    try {
      // Get current user info from localStorage
      const userStr = localStorage.getItem('proton_hercycle_user');
      const currentUser = userStr ? JSON.parse(userStr) : null;

      if (!currentUser || currentUser.role !== 'lecturer') {
        showToast("Only lecturers can delete students with reason notification.", "error");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/lecturer/students/${deletionModal.studentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: deletionReason,
          lecturerId: currentUser.id,
          lecturerName: currentUser.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to remove student.", "error");
        return;
      }

      setStudents(students.filter(s => s._id !== deletionModal.studentId));
      showToast("Student removed successfully. Admin has been notified.");
      setDeletionModal({ isOpen: false, studentId: null, studentName: '' });
      setDeletionReason("");
    } catch (err) {
      console.error('Deletion error:', err);
      showToast("Failed to remove student.", "error");
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-up">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold font-display text-white mb-2">Student Management</h2>
          <p className="text-slate-400">View and manage enrolled students.</p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-800 text-white pl-10 pr-4 py-2 rounded-xl border border-slate-700 focus:border-secondary focus:outline-none w-64"
          />
          <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
        </div>
      </div>

      <div className="bg-bg-card border border-slate-700 rounded-3xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="p-6">Student</th>
              <th className="p-6">Progress</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredStudents.map(student => (
              <tr key={student._id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">

                    {/* --- PROFILE PICTURE DISPLAY --- */}
                    <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center border-2 border-slate-600 shadow-sm">
                      {student.profilePic ? (
                        <img
                          src={student.profilePic}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={24} className="text-slate-500" />
                      )}
                    </div>
                    {/* ------------------------------- */}

                    <div>
                      <p className="text-white font-bold">{student.name}</p>
                      <p className="text-slate-500 text-xs">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold border border-secondary/20">
                    {student.completedCourses ? student.completedCourses.length : 0} Modules Completed
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-slate-400 text-sm font-medium">Active</span>
                  </div>
                </td>
                <td className="p-6 text-right">
                  <button
                    onClick={() => handleRemoveClick(student._id, student.name)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all border border-red-500/20 hover:border-red-500"
                    title="Remove Student"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <User size={48} className="text-slate-700 mb-4" />
            <p>No students found.</p>
          </div>
        )}
      </div>

      {/* Deletion Reason Modal */}
      {deletionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-card border border-slate-700 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Confirm Student Removal</h3>
                <p className="text-slate-400 text-sm">Removing: <span className="text-white font-semibold">{deletionModal.studentName}</span></p>
              </div>
              <button
                onClick={() => setDeletionModal({ isOpen: false, studentId: null, studentName: '' })}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-white font-bold mb-2">Reason for Removal *</label>
              <textarea
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Explain why you are removing this student (minimum 10 characters)..."
                className="w-full bg-slate-800 text-white p-4 rounded-xl border border-slate-700 focus:border-secondary focus:outline-none resize-none"
                rows="4"
              />
              <p className="text-xs text-slate-500 mt-2">
                {deletionReason.length}/10 characters minimum
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
              <p className="text-yellow-500 text-sm font-medium flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>The Platform Admin will be notified of this deletion and the reason you provide.</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletionModal({ isOpen: false, studentId: null, studentName: '' })}
                className="flex-1 px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletion}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/20"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}