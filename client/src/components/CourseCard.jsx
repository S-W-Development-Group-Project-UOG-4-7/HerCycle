import { PlayCircle, Clock, User, ShieldAlert, CheckCircle, Image as ImageIcon } from 'lucide-react';

// Helper function to format relative time
const getRelativeTime = (timestamp) => {
  if (!timestamp) return 'Recently';

  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
};

export default function CourseCard({ course, isCompleted }) {
  return (
    <div className={`bg-bg-card rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-800 hover:border-primary/50 group animate-fade-up hover:-translate-y-2 relative overflow-hidden h-full flex flex-col ${isCompleted ? 'border-green-500/30' : ''}`}>

      {/* IMAGE */}
      <div className="h-48 w-full bg-slate-800 relative overflow-hidden">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600"><ImageIcon size={48} className="opacity-20" /></div>
        )}

        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-md p-3 rounded-full"><PlayCircle className="text-white w-10 h-10" /></div>
        </div>

        {/* TOP BADGES */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isCompleted && (
            <div className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1"><CheckCircle size={10} /> COMPLETED</div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 flex-1 flex flex-col">
        <span className="text-[10px] font-bold font-sans text-secondary uppercase tracking-widest mb-2 bg-secondary/10 px-2 py-1 rounded self-start">
          {course.topic || 'General Health'}
        </span>

        <h3 className="text-2xl font-bold font-hand text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors tracking-wide">
          {course.title}
        </h3>

        <p className="text-slate-400 text-sm font-sans mb-6 line-clamp-2 leading-relaxed flex-1">
          {course.description}
        </p>

        <div className="pt-4 border-t border-slate-700 flex justify-between items-center text-xs font-medium text-slate-500 font-sans">
          <div className="flex items-center gap-1"><User size={14} className="text-secondary" /><span>{course.instructor}</span></div>
          <div className="flex items-center gap-1"><Clock size={14} className="text-secondary" /><span>Updated {getRelativeTime(course.updatedAt)}</span></div>
        </div>
      </div>
    </div>
  );
}