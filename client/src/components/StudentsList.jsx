import { useState, useEffect } from 'react';
import { Trash2, User, Search } from 'lucide-react';

export default function StudentsList({ showToast }) {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => setStudents(data));
  }, []);

  const handleRemove = async (id) => {
    if (window.confirm("Are you sure you want to remove this student? This action is irreversible.")) {
      try {
        await fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' });
        setStudents(students.filter(s => s._id !== id));
        showToast("Student removed successfully.");
      } catch (err) {
        console.error(err);
        showToast("Failed to remove student.", "error");
      }
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
                    onClick={() => handleRemove(student._id)}
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
    </div>
  );
}