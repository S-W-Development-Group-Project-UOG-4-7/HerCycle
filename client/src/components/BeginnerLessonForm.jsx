import { useState } from 'react';
import { Upload, Sparkles, Star, Zap, Plus, Trash2, Save, Eye, Image } from 'lucide-react';

const CATEGORIES = [
    'Body Basics',
    'Emotions & Feelings',
    'Healthy Habits',
    'Growing Up',
    'Staying Safe'
];

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

const EMOJI_OPTIONS = ['📚', '❤️', '😊', '💪', '🌟', '🔥', '🎯', '🧠', '💡', '🌈', '🦋', '🌸', '🍎', '🏃', '😴'];

export default function BeginnerLessonForm({ onSave, initialData = null, onCancel }) {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        content: initialData?.content || '',
        category: initialData?.category || 'Body Basics',
        difficultyLevel: initialData?.difficultyLevel || 'easy',
        xpReward: initialData?.xpReward || 50,
        icon: initialData?.icon || '📚',
        thumbnail: initialData?.thumbnail || '',
        funFact: initialData?.funFact || '',
        isPublished: initialData?.isPublished || false,
        quiz: initialData?.quiz || []
    });

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addQuizQuestion = () => {
        setFormData(prev => ({
            ...prev,
            quiz: [...prev.quiz, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
        }));
    };

    const updateQuizQuestion = (index, field, value) => {
        const newQuiz = [...formData.quiz];
        newQuiz[index] = { ...newQuiz[index], [field]: value };
        setFormData(prev => ({ ...prev, quiz: newQuiz }));
    };

    const updateQuizOption = (questionIndex, optionIndex, value) => {
        const newQuiz = [...formData.quiz];
        newQuiz[questionIndex].options[optionIndex] = value;
        setFormData(prev => ({ ...prev, quiz: newQuiz }));
    };

    const removeQuizQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            quiz: prev.quiz.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
        } finally {
            setSaving(false);
        }
    };

    const getDifficultyColor = (level) => {
        switch (level) {
            case 'easy': return 'bg-green-500';
            case 'medium': return 'bg-yellow-500';
            case 'hard': return 'bg-red-500';
            default: return 'bg-slate-500';
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto animate-fade-up">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Upload className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                    {initialData ? 'Edit Beginner Lesson' : 'Create Beginner Lesson'}
                </h2>
                <p className="text-slate-400">Make learning fun for young students!</p>
            </div>

            <div className="space-y-6">
                {/* Basic Info Section */}
                <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700/50">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="text-purple-400" /> Lesson Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Icon Picker */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Lesson Icon</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="w-full bg-slate-700 rounded-xl p-4 flex items-center gap-4 hover:bg-slate-600 transition-colors"
                                >
                                    <span className="text-4xl">{formData.icon}</span>
                                    <span className="text-slate-400">Click to change</span>
                                </button>

                                {showEmojiPicker && (
                                    <div className="absolute top-full left-0 mt-2 bg-slate-800 rounded-xl p-4 shadow-xl border border-slate-700 z-20 grid grid-cols-5 gap-2">
                                        {EMOJI_OPTIONS.map(emoji => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => { handleChange('icon', emoji); setShowEmojiPicker(false); }}
                                                className="text-3xl p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className="w-full bg-slate-700 text-white rounded-xl p-4 border-none focus:ring-2 focus:ring-purple-500"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-300 mb-2">Lesson Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                required
                                placeholder="e.g., Understanding Your Body"
                                className="w-full bg-slate-700 text-white rounded-xl p-4 border-none focus:ring-2 focus:ring-purple-500 placeholder-slate-500"
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-300 mb-2">Short Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                required
                                rows={2}
                                placeholder="Brief description of what students will learn..."
                                className="w-full bg-slate-700 text-white rounded-xl p-4 border-none focus:ring-2 focus:ring-purple-500 placeholder-slate-500 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Difficulty & XP Section */}
                <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700/50">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Zap className="text-yellow-400" /> Difficulty & Rewards
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Difficulty */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Difficulty Level</label>
                            <div className="flex gap-3">
                                {DIFFICULTY_LEVELS.map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => handleChange('difficultyLevel', level)}
                                        className={`flex-1 py-3 px-4 rounded-xl font-bold capitalize transition-all ${formData.difficultyLevel === level
                                                ? `${getDifficultyColor(level)} text-white shadow-lg`
                                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {[...Array(level === 'easy' ? 1 : level === 'medium' ? 2 : 3)].map((_, i) => (
                                                <Star key={i} size={14} className={formData.difficultyLevel === level ? 'fill-current' : ''} />
                                            ))}
                                        </div>
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* XP Reward */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">XP Reward</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="25"
                                    max="200"
                                    step="25"
                                    value={formData.xpReward}
                                    onChange={(e) => handleChange('xpReward', parseInt(e.target.value))}
                                    className="flex-1 accent-yellow-400"
                                />
                                <div className="bg-yellow-500/20 text-yellow-400 font-bold px-4 py-2 rounded-xl flex items-center gap-2">
                                    <Zap size={18} />
                                    {formData.xpReward} XP
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700/50">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        📝 Lesson Content
                    </h3>

                    {/* Content */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-300 mb-2">
                            Main Content (HTML Supported) *
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => handleChange('content', e.target.value)}
                            required
                            rows={10}
                            placeholder="<h2>Welcome!</h2>&#10;<p>Let's learn about...</p>"
                            className="w-full bg-slate-700 text-white rounded-xl p-4 border-none focus:ring-2 focus:ring-purple-500 placeholder-slate-500 font-mono text-sm"
                        />
                    </div>

                    {/* Thumbnail */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-300 mb-2">Thumbnail URL (Optional)</label>
                        <div className="flex gap-4">
                            <input
                                type="url"
                                value={formData.thumbnail}
                                onChange={(e) => handleChange('thumbnail', e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="flex-1 bg-slate-700 text-white rounded-xl p-4 border-none focus:ring-2 focus:ring-purple-500 placeholder-slate-500"
                            />
                            {formData.thumbnail && (
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-600">
                                    <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fun Fact */}
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">💡 Fun Fact (Optional)</label>
                        <input
                            type="text"
                            value={formData.funFact}
                            onChange={(e) => handleChange('funFact', e.target.value)}
                            placeholder="Did you know? Add an interesting fact here!"
                            className="w-full bg-slate-700 text-white rounded-xl p-4 border-none focus:ring-2 focus:ring-purple-500 placeholder-slate-500"
                        />
                    </div>
                </div>

                {/* Quiz Section */}
                <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            🎯 Quiz Questions
                        </h3>
                        <button
                            type="button"
                            onClick={addQuizQuestion}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
                        >
                            <Plus size={18} /> Add Question
                        </button>
                    </div>

                    {formData.quiz.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>No quiz questions yet. Students will mark the lesson complete without a quiz.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {formData.quiz.map((q, qIndex) => (
                                <div key={qIndex} className="bg-slate-700/50 rounded-xl p-6 relative">
                                    <button
                                        type="button"
                                        onClick={() => removeQuizQuestion(qIndex)}
                                        className="absolute top-4 right-4 text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <label className="block text-sm font-bold text-slate-300 mb-2">
                                        Question {qIndex + 1}
                                    </label>
                                    <input
                                        type="text"
                                        value={q.question}
                                        onChange={(e) => updateQuizQuestion(qIndex, 'question', e.target.value)}
                                        placeholder="Enter your question..."
                                        className="w-full bg-slate-600 text-white rounded-xl p-4 mb-4 border-none focus:ring-2 focus:ring-purple-500"
                                    />

                                    <label className="block text-sm font-bold text-slate-300 mb-2">Options</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {q.options.map((option, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`correct-${qIndex}`}
                                                    checked={q.correctAnswer === oIndex}
                                                    onChange={() => updateQuizQuestion(qIndex, 'correctAnswer', oIndex)}
                                                    className="accent-green-500"
                                                />
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => updateQuizOption(qIndex, oIndex, e.target.value)}
                                                    placeholder={`Option ${oIndex + 1}`}
                                                    className="flex-1 bg-slate-600 text-white rounded-lg px-4 py-2 border-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Select the radio button next to the correct answer</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Publish Toggle */}
                <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="text-white font-bold">Publish Lesson</p>
                            <p className="text-slate-400 text-sm">Make this lesson visible to students</p>
                        </div>
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={formData.isPublished}
                                onChange={(e) => handleChange('isPublished', e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-14 h-8 rounded-full transition-colors ${formData.isPublished ? 'bg-green-500' : 'bg-slate-600'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform mt-1 ${formData.isPublished ? 'translate-x-7' : 'translate-x-1'}`} />
                            </div>
                        </div>
                    </label>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-slate-700 text-white py-4 rounded-xl font-bold hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={20} />
                                {initialData ? 'Update Lesson' : 'Create Lesson'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
