
import { useState } from 'react';
import { PlusCircle, ShieldAlert, Trash2, CheckSquare, Edit, FileText, ChevronDown, ChevronRight, Image as ImageIcon, Loader2, Video, Link as LinkIcon, UploadCloud, Tag } from 'lucide-react';



export default function CourseForm({ onAddCourse, initialData = null }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isRestricted, setIsRestricted] = useState(initialData?.isRestricted ?? true);
  const [quizQuestions, setQuizQuestions] = useState(initialData?.quiz || []);
  const [lessons, setLessons] = useState(initialData?.lessons || []);

  //Topic State
  const [topic, setTopic] = useState(initialData?.topic || "General Health");

  // Thumbnail States
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.thumbnail || "");
  const [isUploading, setIsUploading] = useState(false);

  // UI Toggles
  const [showQuizBuilder, setShowQuizBuilder] = useState(!!(initialData?.quiz && initialData.quiz.length > 0));
  const [showLessonBuilder, setShowLessonBuilder] = useState(true);

  // Staging
  const [qText, setQText] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [opt3, setOpt3] = useState("");
  const [opt4, setOpt4] = useState("");
  const [correctIdx, setCorrectIdx] = useState(0);

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState('text');
  const [lessonContent, setLessonContent] = useState("");
  const [lessonFile, setLessonFile] = useState(null);
  const [isUploadingLesson, setIsUploadingLesson] = useState(false);

  // UPLOAD TO CLOUDINARY 
  const uploadToCloudinary = async (file, resourceType = 'image') => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, { method: "POST", body: data });
    if (!res.ok) throw new Error(`${resourceType} upload failed`);
    const cloudData = await res.json();
    return cloudData.url;
  };

  // --- FUNCTIONS ---
  const handleAddLesson = async () => {
    if (!lessonTitle) return null;
    let finalContent = lessonContent;
    let finalType = lessonType;

    if (lessonType === 'video') {
      if (!lessonFile) return alert("Please select a video file.");
      try {
        setIsUploadingLesson(true);
        finalContent = await uploadToCloudinary(lessonFile, 'video');
      } catch (error) {
        console.error(error);
        setIsUploadingLesson(false);
        return alert("Video upload failed.");
      }
    } else {
      if (!lessonContent) return alert("Lesson Content is required.");
    }

    const newLesson = { title: lessonTitle, content: finalContent, type: finalType };
    const updatedLessons = [...lessons, newLesson];
    setLessons(updatedLessons);
    setLessonTitle(""); setLessonContent(""); setLessonFile(null); setIsUploadingLesson(false);
    return updatedLessons;
  };

  const removeLesson = (index) => setLessons(lessons.filter((_, i) => i !== index));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddQuestion = () => {
    if (!qText || !opt1 || !opt2) return alert("Question and at least 2 options are required.");
    const rawOptions = [opt1, opt2, opt3, opt4].filter(o => o.trim() !== "");
    const newQuestion = { question: qText, options: rawOptions, correctAnswer: parseInt(correctIdx) };
    setQuizQuestions([...quizQuestions, newQuestion]);
    setQText(""); setOpt1(""); setOpt2(""); setOpt3(""); setOpt4(""); setCorrectIdx(0);
  };

  const removeQuestion = (index) => setQuizQuestions(quizQuestions.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!title || !description) return alert("Title and Description are required");

    setIsUploading(true);
    let finalThumbnailUrl = thumbnail;
    let finalLessons = [...lessons];

    if (lessonTitle && (lessonContent || lessonFile)) {
      if (window.confirm("You have an unsaved lesson. Include it?")) {
        const added = await handleAddLesson();
        if (added) finalLessons = added;
      }
    }

    if (imageFile) {
      try {
        finalThumbnailUrl = await uploadToCloudinary(imageFile, 'image');
      } catch (err) {
        console.error(err);
        setIsUploading(false);
        return alert("Thumbnail upload failed.");
      }
    }

    onAddCourse({
      title, description, isRestricted, thumbnail: finalThumbnailUrl, quiz: quizQuestions, lessons: finalLessons,
      topic: topic
    });

    if (!initialData) {
      setTitle(""); setDescription(""); setIsRestricted(false); setThumbnail(""); setPreviewUrl(""); setImageFile(null);
      setQuizQuestions([]); setLessons([]); setLessonTitle(""); setLessonContent(""); setLessonFile(null);
      setTopic("General Health");
    }
    setIsUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto bg-bg-card p-8 rounded-3xl shadow-2xl mb-12 border border-slate-700 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        {initialData ? <Edit className="text-secondary w-6 h-6" /> : <PlusCircle className="text-secondary w-6 h-6" />}
        <h2 className="text-xl font-bold font-display text-white">
          {initialData ? 'Edit Module' : 'Create New Module'}
        </h2>
      </div>

      <div className="flex flex-col gap-5">

        {/* TOPIC SELECTOR */}
        <div>
          <label className="block text-slate-400 text-sm font-bold mb-2 ml-1">Topic / Category</label>
          <div className="relative">
            <Tag className="absolute left-3 top-3 text-slate-500" size={18} />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic (e.g., Menstruation, Mental Health, Nutrition...)"
              className="w-full pl-10 p-3 bg-bg-input text-white border border-slate-600 rounded-xl focus:outline-none focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* THUMBNAIL */}
        <div className="w-full">
          <label className="block text-slate-400 text-sm font-bold mb-2 ml-1">Module Thumbnail</label>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 bg-bg-input rounded-xl border border-slate-600 overflow-hidden flex items-center justify-center relative">
              {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-500 w-8 h-8" />}
            </div>
            <div className="flex-1">
              <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer" />
              <p className="text-xs text-slate-500 mt-2">Recommended: 1280x720px JPG or PNG</p>
            </div>
          </div>
        </div>

        <input className="p-4 bg-bg-input text-white border border-slate-600 rounded-xl focus:outline-none focus:border-secondary transition-all" placeholder="Module Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="p-4 bg-bg-input text-white border border-slate-600 rounded-xl focus:outline-none focus:border-secondary transition-all h-24" placeholder="Course Overview / Description..." value={description} onChange={(e) => setDescription(e.target.value)} />

        <div onClick={() => setIsRestricted(!isRestricted)} className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition-all ${isRestricted ? 'bg-red-900/20 border-red-500' : 'bg-bg-input border-slate-600'}`}>
          <ShieldAlert className={isRestricted ? "text-red-500" : "text-slate-500"} />
          <div>
            <p className={`font-bold ${isRestricted ? "text-red-400" : "text-slate-300"}`}>Age Restricted (15+ / Grade 10+)</p>
            <p className="text-xs text-slate-500 mt-1">Only students aged 15 and above can access this content</p>
          </div>
          {isRestricted && <span className="ml-auto text-red-500 font-bold">✓</span>}
        </div>

        {/* LESSONS */}
        <div className="border-t border-slate-700 pt-6">
          <div onClick={() => setShowLessonBuilder(!showLessonBuilder)} className="flex items-center gap-2 mb-4 text-white font-bold cursor-pointer hover:opacity-80">
            {showLessonBuilder ? <ChevronDown size={20} className="text-secondary" /> : <ChevronRight size={20} className="text-slate-500" />}
            <FileText className={showLessonBuilder ? "text-secondary" : "text-slate-500"} />
            <span>Lessons ({lessons.length})</span>
          </div>
          {showLessonBuilder && (
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              {lessons.map((l, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700 mb-2">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-slate-700 p-2 rounded-lg">{l.type === 'video' ? <Video size={16} className="text-secondary" /> : <FileText size={16} className="text-slate-400" />}</div>
                    <span className="text-sm text-slate-300 truncate font-bold">{i + 1}. {l.title}</span>
                  </div>
                  <button onClick={() => removeLesson(i)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                </div>
              ))}
              <div className="mt-4 space-y-4 border-t border-slate-700/50 pt-4">
                <input className="w-full p-3 bg-bg-input text-white border border-slate-600 rounded-lg text-sm" placeholder="Lesson Title" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
                <div className="flex gap-4">
                  <button onClick={() => setLessonType('text')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${lessonType === 'text' ? 'bg-primary text-white' : 'bg-slate-700 text-slate-400'}`}><LinkIcon size={16} /> Text / Link</button>
                  <button onClick={() => setLessonType('video')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${lessonType === 'video' ? 'bg-primary text-white' : 'bg-slate-700 text-slate-400'}`}><Video size={16} /> Upload Video</button>
                </div>
                {lessonType === 'text' ? (
                  <textarea className="w-full p-3 bg-bg-input text-white border border-slate-600 rounded-lg text-sm h-20" placeholder="Content..." value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} />
                ) : (
                  <div className="border border-dashed border-slate-600 rounded-lg p-6 text-center hover:bg-slate-700/30 transition-colors">
                    <input type="file" accept="video/*" onChange={(e) => setLessonFile(e.target.files[0])} className="hidden" id="video-upload" />
                    <label htmlFor="video-upload" className="cursor-pointer block">
                      {lessonFile ? <span className="text-secondary font-bold flex items-center justify-center gap-2"><Video size={20} /> {lessonFile.name}</span> : <span className="text-slate-400 flex flex-col items-center gap-2"><UploadCloud size={24} /> Click to select video file</span>}
                    </label>
                  </div>
                )}
                <button onClick={handleAddLesson} disabled={isUploadingLesson} className={`bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg text-sm font-bold w-full border border-slate-500 flex items-center justify-center gap-2 ${isUploadingLesson ? 'opacity-50 cursor-wait' : ''}`}>
                  {isUploadingLesson && <Loader2 className="animate-spin" size={16} />}
                  {isUploadingLesson ? 'Uploading Video...' : '+ Add Lesson'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* QUIZ */}
        <div className="border-t border-slate-700 pt-6">
          <div onClick={() => setShowQuizBuilder(!showQuizBuilder)} className="flex items-center gap-2 cursor-pointer mb-4 hover:opacity-80">
            {showQuizBuilder ? <ChevronDown size={20} className="text-secondary" /> : <ChevronRight size={20} className="text-slate-500" />}
            <CheckSquare className={showQuizBuilder ? "text-secondary" : "text-slate-500"} />
            <span className="text-white font-bold">{quizQuestions.length > 0 ? `Edit Quiz (${quizQuestions.length} questions)` : 'Attach Quiz'}</span>
          </div>
          {showQuizBuilder && (
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              {quizQuestions.map((q, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700 mb-2">
                  <span className="text-sm text-slate-300 truncate w-3/4">{i + 1}. {q.question}</span>
                  <button onClick={() => removeQuestion(i)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                </div>
              ))}
              <div className="space-y-3 mt-4 border-t border-slate-700/50 pt-4">
                <input className="w-full p-3 bg-bg-input text-white border border-slate-600 rounded-lg text-sm" placeholder="Question Text..." value={qText} onChange={(e) => setQText(e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="p-2 bg-bg-input text-white border border-slate-600 rounded-lg text-sm" placeholder="Opt 1" value={opt1} onChange={(e) => setOpt1(e.target.value)} />
                  <input className="p-2 bg-bg-input text-white border border-slate-600 rounded-lg text-sm" placeholder="Opt 2" value={opt2} onChange={(e) => setOpt2(e.target.value)} />
                  <input className="p-2 bg-bg-input text-white border border-slate-600 rounded-lg text-sm" placeholder="Opt 3" value={opt3} onChange={(e) => setOpt3(e.target.value)} />
                  <input className="p-2 bg-bg-input text-white border border-slate-600 rounded-lg text-sm" placeholder="Opt 4" value={opt4} onChange={(e) => setOpt4(e.target.value)} />
                </div>
                <div className="flex items-center gap-3">
                  <select value={correctIdx} onChange={(e) => setCorrectIdx(e.target.value)} className="p-2 bg-bg-input text-white border border-slate-600 rounded-lg text-sm flex-1"><option value={0}>Option 1</option><option value={1}>Option 2</option><option value={2}>Option 3</option><option value={3}>Option 4</option></select>
                  <button onClick={handleAddQuestion} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold border border-slate-500">Add Question</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={isUploading} className={`bg-secondary hover:bg-secondary-dark text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)] mt-4 active:scale-95 transition-all flex items-center justify-center gap-2 ${isUploading ? 'opacity-70 cursor-wait' : ''}`}>
          {isUploading && <Loader2 className="animate-spin" />}
          {isUploading ? 'Uploading Data...' : (initialData ? 'Update Module' : 'Publish Course')}
        </button>
      </div>
    </div>
  );
}
