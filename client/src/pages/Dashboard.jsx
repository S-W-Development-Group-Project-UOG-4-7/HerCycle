
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import CourseForm from '../components/CourseForm';
import CourseCard from '../components/CourseCard';
import CourseDetail from '../components/CourseDetail';
import QuizModal from '../components/QuizModal';
import PlaceholderView from '../components/PlaceholderView';
import Toast from '../components/Toast';
import StudentsList from '../components/StudentsList';
import SettingsView from '../components/SettingsView';
import NotesView from '../components/NotesView';
import AdminDashboard from './AdminDashboard';
import ChatView from '../components/ChatView';
import HistoryView from '../components/HistoryView';
import ModificationModal from '../components/ModificationModal';
import BeginnerEducationView from '../components/BeginnerEducationView';
import BeginnerProgressDashboard from '../components/BeginnerProgressDashboard';
import BeginnerLessonDetail from '../components/BeginnerLessonDetail';
import BeginnerLessonForm from '../components/BeginnerLessonForm';
import BeginnerWelcome from '../components/BeginnerWelcome';
import { BookOpen, UserCircle, UploadCloud, Edit, Trash2, Filter, Layers, Users, Menu } from 'lucide-react';

// Calculate age helper
const calculateUserAge = (dobString) => {
  if (!dobString) return 18;
  const birthday = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const m = today.getMonth() - birthday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) { age--; }
  return age;
};

export default function Dashboard({ user, onLogout }) {
  // Determine if student should see beginner platform based on age
  const userAgeInit = calculateUserAge(user.dob);
  const isBeginnerStudentInit = user.role === 'student' && userAgeInit < 15;

  const [activeTab, setActiveTab] = useState(
    user.role === 'admin' ? 'dashboard'
      : user.role === 'lecturer' ? 'upload'
        : isBeginnerStudentInit ? 'beginner-education'
          : 'education'
  );

  // Beginner platform state
  const [selectedBeginnerLesson, setSelectedBeginnerLesson] = useState(null);
  const [beginnerProgress, setBeginnerProgress] = useState(null);
  const [editingBeginnerLesson, setEditingBeginnerLesson] = useState(null);
  const [showBeginnerWelcome, setShowBeginnerWelcome] = useState(isBeginnerStudentInit);


  const [currentUser, setCurrentUser] = useState(user);

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [completedIds, setCompletedIds] = useState(user.completedCourses || []);
  const [editingCourse, setEditingCourse] = useState(null);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modification modal state
  const [modificationModal, setModificationModal] = useState({ isOpen: false, action: null, courseId: null, courseTitle: '', pendingData: null });

  const showToast = (message, type = 'success') => setToast({ message, type });

  const calculateAge = (dobString) => {
    if (!dobString) return 0;
    const birthday = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) { age--; }
    return age;
  };
  const userAge = calculateAge(currentUser.dob);

  useEffect(() => {
    fetch('http://localhost:5000/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data));
  }, []);

  const uniqueTopics = ['All', ...new Set(courses.map(c => c.topic || 'General Health'))];

  // --- HANDLERS ---

  const handleUpdateUser = (updatedData) => {
    setCurrentUser({ ...currentUser, ...updatedData });
  };

  const handleSaveCourse = async (courseData) => {
    try {
      if (editingCourse) {
        // Check if admin is editing someone else's course - require reason
        if (currentUser.role === 'admin' && editingCourse.createdBy && editingCourse.createdBy !== currentUser.id) {
          // Store pending edit data and show modal for reason
          setModificationModal({
            isOpen: true,
            action: 'edit',
            courseId: editingCourse._id,
            courseTitle: editingCourse.title,
            pendingData: courseData
          });
          return; // Don't proceed until modal confirms
        }

        // Normal edit (own course or no createdBy)
        const response = await fetch(`http://localhost:5000/api/courses/${editingCourse._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...courseData })
        });
        const updatedCourse = await response.json();
        setCourses(courses.map(c => c._id === updatedCourse._id ? updatedCourse : c));
        setEditingCourse(null);
        showToast("Module updated successfully!");
      } else {
        const response = await fetch('http://localhost:5000/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...courseData,
            instructor: currentUser.name,
            duration: "2 Weeks",
            createdBy: currentUser.id // Track who created it
          })
        });
        const newCourse = await response.json();
        setCourses([...courses, newCourse]);
        showToast("New module published successfully!");
      }
      setActiveTab(currentUser.role === 'admin' ? 'manage-courses' : 'education');
    } catch (error) {
      console.error(error);
      showToast("Something went wrong.", "error");
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    // Admin requires reason, lecturers get simple confirmation
    if (currentUser.role === 'admin') {
      const course = courses.find(c => c._id === courseId);
      if (course && course.createdBy !== currentUser.id) {
        // Admin deleting someone else's course - show modal
        setModificationModal({
          isOpen: true,
          action: 'delete',
          courseId,
          courseTitle: courseTitle || course.title
        });
        return;
      }
    }

    // Normal deletion (own course or regular permission)
    if (window.confirm("Are you sure?")) {
      try {
        await fetch(`http://localhost:5000/api/courses/${courseId}`, { method: 'DELETE' });
        setCourses(courses.filter(c => c._id !== courseId));
        showToast("Module deleted successfully.", "success");
      } catch (error) {
        console.error(error);
        showToast("Failed to delete module.", "error");
      }
    }
  };

  const handleModificationConfirm = async (reason) => {
    const { action, courseId, pendingData } = modificationModal;

    try {
      if (action === 'delete') {
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}/admin-delete`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reason,
            modifiedBy: currentUser.id,
            modifierName: currentUser.name,
            modifierRole: currentUser.role
          })
        });

        if (response.ok) {
          setCourses(courses.filter(c => c._id !== courseId));
          showToast("Course deleted successfully. Creator has been notified.", "success");
        } else {
          throw new Error('Failed to delete');
        }
      } else if (action === 'edit' && pendingData) {
        // Handle admin edit with reason
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}/admin-edit`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...pendingData,
            reason,
            modifiedBy: currentUser.id,
            modifierName: currentUser.name,
            modifierRole: currentUser.role
          })
        });

        if (response.ok) {
          const data = await response.json();
          setCourses(courses.map(c => c._id === courseId ? data.course : c));
          setEditingCourse(null);
          showToast("Course updated successfully. Creator has been notified.", "success");
          setActiveTab('manage-courses');
        } else {
          throw new Error('Failed to update');
        }
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to complete action.", "error");
    } finally {
      setModificationModal({ isOpen: false, action: null, courseId: null, courseTitle: '', pendingData: null });
    }
  };

  const handleEditClick = (course) => {
    setEditingCourse(course);
    setActiveTab('upload');
  };

  const handleCompleteClick = () => {
    if (selectedCourse.quiz && selectedCourse.quiz.length > 0) {
      setShowQuiz(true);
    } else {
      markAsDone();
      showToast("Congratulations! Module completed.");
    }
  };

  const markAsDone = async () => {
    await fetch(`http://localhost:5000/api/users/${currentUser.id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: selectedCourse._id })
    });
    setCompletedIds((prev) => [...prev, selectedCourse._id]);
  };

  // --- RENDER CONTENT ---
  const renderContent = () => {
    if (selectedCourse) {
      return (
        <>
          <CourseDetail
            course={selectedCourse}
            onBack={() => setSelectedCourse(null)}
            onComplete={handleCompleteClick}
            isCompleted={completedIds.includes(selectedCourse._id)}
          />
          {showQuiz && (
            <QuizModal quiz={selectedCourse.quiz} onClose={() => setShowQuiz(false)} onPass={markAsDone} />
          )}
        </>
      );
    }

    switch (activeTab) {
      case 'upload':
        return (
          <div className="animate-fade-up max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 shadow-lg"><UploadCloud className="w-8 h-8 text-secondary" /></div>
              <h2 className="text-3xl font-bold font-display text-white mb-2">{editingCourse ? 'Edit Content' : 'Upload Content'}</h2>
              {editingCourse && <button onClick={() => setEditingCourse(null)} className="text-sm text-red-400 hover:underline">Cancel Edit</button>}
            </div>
            <CourseForm key={editingCourse ? editingCourse._id : 'new'} onAddCourse={handleSaveCourse} initialData={editingCourse} />
          </div>
        );

      case 'education': {
        const visibleCourses = courses.filter(course => {
          // LECTURER FILTER: Only show courses created by this lecturer
          if (currentUser.role === 'lecturer' && course.createdBy !== currentUser.id) {
            return false;
          }

          if (currentUser.role === 'student' && userAge < 15 && course.isRestricted) return false;
          if (currentUser.role === 'student') {
            const isCompleted = completedIds.includes(course._id);
            if (filterStatus === 'completed' && !isCompleted) return false;
            if (filterStatus === 'active' && isCompleted) return false;
          }
          if (selectedTopic !== 'All' && (course.topic || 'General Health') !== selectedTopic) return false;
          return true;
        });

        return (
          <div className="animate-fade-up">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold font-display text-white mb-2">
                  {currentUser.role === 'lecturer' ? 'My Content' : 'My Courses'}
                </h2>
                <p className="text-slate-400">
                  {currentUser.role === 'lecturer'
                    ? 'Manage content you have created.'
                    : 'Browse and manage your learning materials.'}
                </p>
              </div>
              {currentUser.role === 'student' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="appearance-none bg-slate-800 text-white pl-4 pr-10 py-2 mt-1 rounded-xl border border-slate-700 focus:border-secondary focus:outline-none cursor-pointer text-sm font-bold">
                      {uniqueTopics.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <Filter size={14} className="absolute right-3 top-3 mt-1 text-slate-500 pointer-events-none" />
                  </div>
                  <div className="flex bg-slate-800 p-1 rounded-xl">
                    {['all', 'active', 'completed'].map(status => (
                      <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filterStatus === status ? 'bg-secondary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>{status}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {visibleCourses.map((course) => {
                // Permission check: Allow edit if:
                // - User is admin, OR
                // - User created the module, OR
                // - Module has no createdBy (old modules before we added this feature)
                const canEdit = currentUser.role === 'admin' ||
                  course.createdBy === currentUser.id ||
                  !course.createdBy;

                return (
                  <div key={course._id} className="relative group/card">
                    {(currentUser.role === 'lecturer' || currentUser.role === 'admin') && canEdit && (
                      <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(course); }} className="bg-white/90 p-2 rounded-full text-slate-800 shadow-lg hover:bg-primary hover:text-white"><Edit size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course._id, course.title); }} className="bg-white/90 p-2 rounded-full text-red-600 shadow-lg hover:bg-red-600 hover:text-white"><Trash2 size={16} /></button>
                      </div>
                    )}
                    <div onClick={() => setSelectedCourse(course)} className="cursor-pointer h-full">
                      <CourseCard course={course} isCompleted={completedIds.includes(course._id)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'topics': {
        const grouped = courses.reduce((acc, course) => {
          const t = course.topic || "General Health";
          if (!acc[t]) acc[t] = [];
          acc[t].push(course);
          return acc;
        }, {});
        return (
          <div className="animate-fade-up">
            <div className="mb-8">
              <h2 className="text-3xl font-bold font-display text-white mb-2">Course Topics</h2>
              <p className="text-slate-400">Manage your content structure.</p>
            </div>
            <div className="space-y-8">
              {Object.keys(grouped).map(topicName => (
                <div key={topicName} className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Layers className="text-secondary" /> {topicName}
                    <span className="text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded-full">{grouped[topicName].length} modules</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {grouped[topicName].map(course => (
                      <div key={course._id} onClick={() => setSelectedCourse(course)} className="bg-bg-card p-4 rounded-xl border border-slate-700 hover:border-secondary cursor-pointer transition-colors flex items-center gap-3">
                        {course.thumbnail ? <img src={course.thumbnail} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 bg-slate-700 rounded-lg" />}
                        <div>
                          <h4 className="font-bold text-white text-sm line-clamp-1">{course.title}</h4>
                          <p className="text-xs text-slate-500">{course.lessons.length} Lessons</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'students':
        return <StudentsList showToast={showToast} />;

      case 'settings':
        return <SettingsView user={currentUser} onUpdateUser={handleUpdateUser} showToast={showToast} />;

      case 'notes': return <NotesView user={currentUser} />;
      case 'community': return <PlaceholderView title="Community Forum" />;

      // Admin routes
      case 'dashboard': return <AdminDashboard showToast={showToast} />;
      case 'manage-courses': {
        // Admin can manage all courses
        return (
          <div className="animate-fade-up">
            <div className="mb-8">
              <h2 className="text-3xl font-bold font-display text-white mb-2">All Courses</h2>
              <p className="text-slate-400">Manage all platform courses - you can edit or delete any course</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course._id} className="relative group/card">
                  {/* Admin controls - always visible for admin */}
                  <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditClick(course); }}
                      className="bg-white/90 p-2 rounded-full text-slate-800 shadow-lg hover:bg-primary hover:text-white transition-all"
                      title="Edit Course"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course._id, course.title); }}
                      className="bg-white/90 p-2 rounded-full text-red-600 shadow-lg hover:bg-red-600 hover:text-white transition-all"
                      title="Delete Course"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div onClick={() => setSelectedCourse(course)} className="cursor-pointer h-full">
                    <CourseCard course={course} isCompleted={false} hideRestrictedBadge={false} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'messages':
        return <ChatView user={currentUser} showToast={showToast} />;

      case 'history':
        return <HistoryView showToast={showToast} />;

      // --- BEGINNER PLATFORM ROUTES ---
      case 'beginner-education':
        // Show welcome screen first for beginner students
        if (showBeginnerWelcome) {
          return (
            <BeginnerWelcome
              user={currentUser}
              progress={beginnerProgress}
              onContinue={() => {
                setShowBeginnerWelcome(false);
                // Fetch progress for welcome stats
                fetch(`http://localhost:5000/api/beginner/progress/${currentUser.id}`)
                  .then(res => res.json())
                  .then(data => setBeginnerProgress(data))
                  .catch(() => { });
              }}
            />
          );
        }
        if (selectedBeginnerLesson) {
          return (
            <BeginnerLessonDetail
              lesson={selectedBeginnerLesson}
              userProgress={beginnerProgress}
              onBack={() => setSelectedBeginnerLesson(null)}
              onComplete={(data) => {
                setBeginnerProgress(prev => ({ ...prev, ...data }));
                showToast(`🎉 +${data.xpEarned} XP earned!`);
              }}
            />
          );
        }
        return (
          <BeginnerEducationView
            user={currentUser}
            onSelectLesson={(lesson) => {
              setSelectedBeginnerLesson(lesson);
              // Fetch latest progress
              fetch(`http://localhost:5000/api/beginner/progress/${currentUser.id}`)
                .then(res => res.json())
                .then(data => setBeginnerProgress(data));
            }}
            onShowProgress={() => setActiveTab('beginner-progress')}
          />
        );

      case 'beginner-progress':
        return (
          <BeginnerProgressDashboard
            user={currentUser}
            onBack={() => setActiveTab('beginner-education')}
          />
        );

      case 'beginner-achievements':
        return (
          <BeginnerProgressDashboard
            user={currentUser}
            onBack={() => setActiveTab('beginner-education')}
          />
        );

      case 'beginner-upload':
        return (
          <div className="animate-fade-up max-w-4xl mx-auto">
            <BeginnerLessonForm
              initialData={editingBeginnerLesson}
              onSave={async (lessonData) => {
                try {
                  const url = editingBeginnerLesson
                    ? `http://localhost:5000/api/beginner/lessons/${editingBeginnerLesson._id}`
                    : 'http://localhost:5000/api/beginner/lessons';
                  const method = editingBeginnerLesson ? 'PUT' : 'POST';

                  await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...lessonData, createdBy: currentUser.id })
                  });

                  setEditingBeginnerLesson(null);
                  showToast(editingBeginnerLesson ? 'Lesson updated!' : 'Lesson created!');
                  setActiveTab('beginner-upload');
                } catch (error) {
                  showToast('Failed to save lesson', 'error');
                }
              }}
              onCancel={() => setEditingBeginnerLesson(null)}
            />
          </div>
        );

      case 'beginner-manage':
        return <PlaceholderView title="Manage Beginner Lessons" />;

      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-bg-dark font-sans overflow-hidden">
      <Sidebar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />
      <main className="flex-1 h-screen overflow-y-auto relative scroll-smooth">
        <header className="sticky top-0 z-30 bg-bg-dark/80 backdrop-blur-md px-4 md:px-8 py-5 flex justify-between items-center border-b border-slate-800">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden text-white hover:text-primary transition-colors p-2"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-white font-bold font-display">{currentUser.name}</p>
              <div className="flex items-center justify-end gap-2">
                <p className="text-primary text-xs font-bold uppercase tracking-wider">{currentUser.role}</p>
                {currentUser.role === 'student' && <span className="text-slate-500 text-xs">({userAge} yrs)</span>}
              </div>
            </div>

            {/* PROFILE PIC IN HEADER */}
            <div className="bg-slate-800 p-1 rounded-full border border-slate-700 shadow-lg overflow-hidden w-12 h-12">
              {currentUser.profilePic ? (
                <img src={currentUser.profilePic} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><UserCircle className="text-slate-300 w-8 h-8" /></div>
              )}
            </div>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto pb-20">{renderContent()}</div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Modification Modal */}
        <ModificationModal
          isOpen={modificationModal.isOpen}
          onClose={() => setModificationModal({ isOpen: false, action: null, courseId: null, courseTitle: '', pendingData: null })}
          onConfirm={handleModificationConfirm}
          action={modificationModal.action}
          courseTitle={modificationModal.courseTitle}
        />
      </main>
    </div>
  );
}