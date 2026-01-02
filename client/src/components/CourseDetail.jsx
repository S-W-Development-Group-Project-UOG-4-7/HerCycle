import { useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, User, PlayCircle, FileText, Video } from 'lucide-react';

export default function CourseDetail({ course, onBack, onComplete, isCompleted }) {
  const [activeLessonIdx, setActiveLessonIdx] = useState(course.lessons && course.lessons.length > 0 ? 0 : null);
  const activeLesson = activeLessonIdx !== null ? course.lessons[activeLessonIdx] : null;

  return (
    <div className="animate-fade-up grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div className="lg:col-span-2">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={20} /> Back to Courses
        </button>

        {/* --- HERO HEADER --- */}
        <div className="relative rounded-3xl overflow-hidden mb-8 border border-slate-700 bg-slate-800">
           {course.thumbnail && (
             <div className="absolute inset-0 z-0">
               <img src={course.thumbnail} alt="Cover" className="w-full h-full object-cover opacity-30" />
               <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/80 to-transparent"></div>
             </div>
           )}

           <div className="relative z-10 p-8">
              <div className="flex justify-between items-start">
                <h1 className="text-4xl font-black font-display text-white mb-4 leading-tight drop-shadow-lg">{course.title}</h1>
                {isCompleted && (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2 font-bold text-sm shadow-lg">
                    <CheckCircle size={16} /> Completed
                  </div>
                )}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed max-w-2xl drop-shadow-md">{course.description}</p>
              
              <div className="flex gap-6 text-slate-400 text-xs font-bold uppercase tracking-wider mt-6">
                <div className="flex items-center gap-2"><User size={16} className="text-secondary"/> {course.instructor}</div>
                <div className="flex items-center gap-2"><Clock size={16} className="text-secondary"/> {course.duration}</div>
              </div>
           </div>
        </div>

        {/* --- ACTIVE LESSON VIEW --- */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 min-h-[400px] flex flex-col relative overflow-hidden">
          {activeLesson ? (
            <>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                {activeLesson.type === 'video' ? <Video className="text-secondary w-8 h-8" /> : <FileText className="text-secondary w-8 h-8" />}
                <h2 className="text-2xl font-bold text-white">{activeLesson.title}</h2>
              </div>
              
              <div className="prose prose-invert max-w-none text-slate-300 leading-loose w-full">
                 {/* 1. VIDEO PLAYER */}
                 {activeLesson.type === 'video' ? (
                   <div className="rounded-xl overflow-hidden border border-slate-700 shadow-xl bg-black">
                     <video 
                        src={activeLesson.content} 
                        controls 
                        className="w-full max-h-[500px]"
                        poster={course.thumbnail} 
                     >
                        Your browser does not support the video tag.
                     </video>
                   </div>
                 ) : 
                 /* 2. EXTERNAL LINK */
                 activeLesson.content.startsWith('http') ? (
                   <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-600 flex items-center gap-4">
                     <div className="bg-slate-600 p-3 rounded-full"><LinkIcon size={24} /></div>
                     <div>
                       <h4 className="font-bold text-white mb-1">External Resource</h4>
                       <a href={activeLesson.content} target="_blank" rel="noreferrer" className="text-secondary underline break-all">
                         {activeLesson.content}
                       </a>
                     </div>
                   </div>
                 ) : (
                 /* 3. PLAIN TEXT */
                   <p>{activeLesson.content}</p>
                 )}
              </div>
            </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center">
               <div className="bg-slate-700 p-4 rounded-full mb-4">
                 <FileText className="w-12 h-12 text-slate-500" />
               </div>
               <h3 className="text-xl font-bold text-slate-400">No Lessons Added</h3>
               <p className="text-slate-500">The instructor hasn't uploaded content yet.</p>
             </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          {!isCompleted ? (
            <button 
              onClick={onComplete}
              className="bg-primary hover:bg-primary-dark text-white text-lg font-bold px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all flex items-center gap-3 active:scale-95"
            >
              Mark Module as Completed <CheckCircle size={24} />
            </button>
          ) : (
            <button disabled className="bg-slate-700 text-slate-400 text-lg font-bold px-8 py-4 rounded-xl cursor-default opacity-50 border border-slate-600">
              Module Finished
            </button>
          )}
        </div>
      </div>

      {/* --- LESSON LIST --- */}
      <div className="lg:col-span-1">
        <div className="bg-bg-card border border-slate-700 rounded-3xl p-6 sticky top-6">
           <h3 className="text-white font-bold font-display text-xl mb-4 flex items-center gap-2">
             <FileText className="text-secondary" /> Course Content
           </h3>
           <div className="space-y-2">
             {course.lessons && course.lessons.length > 0 ? (
               course.lessons.map((lesson, idx) => (
                 <button
                   key={idx}
                   onClick={() => setActiveLessonIdx(idx)}
                   className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 group ${
                     activeLessonIdx === idx 
                       ? 'bg-secondary text-white border-secondary shadow-lg' 
                       : 'bg-bg-input text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                   }`}
                 >
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                     activeLessonIdx === idx ? 'bg-white text-secondary' : 'bg-slate-800 text-slate-500'
                   }`}>
                     {lesson.type === 'video' ? <Video size={14} /> : (idx + 1)}
                   </div>
                   <span className="font-bold text-sm truncate">{lesson.title}</span>
                 </button>
               ))
             ) : (
               <p className="text-slate-500 text-sm italic">No lessons available.</p>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}