import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, Sparkles } from 'lucide-react';

export default function NotesView({ user }) {
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '', color: 'pink' });

    // Fetch notes on mount
    useEffect(() => {
        const fetchNotes = async () => {
            if (!user?.id) return;
            try {
                setIsLoading(true);
                const response = await fetch(`http://localhost:5000/api/notes/${user.id}`);
                const data = await response.json();
                setNotes(data);
            } catch (error) {
                console.error('Failed to fetch notes:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotes();
    }, [user?.id]);

    const colors = {
        pink: { bg: 'bg-pink-500/10', border: 'border-pink-500', text: 'text-pink-400', hover: 'hover:border-pink-400' },
        purple: { bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-400', hover: 'hover:border-purple-400' },
        blue: { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-400', hover: 'hover:border-blue-400' },
        green: { bg: 'bg-green-500/10', border: 'border-green-500', text: 'text-green-400', hover: 'hover:border-green-400' },
        yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500', text: 'text-yellow-400', hover: 'hover:border-yellow-400' }
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenModal = (note = null) => {
        if (note) {
            setEditingNote(note);
            setFormData({ title: note.title, content: note.content, color: note.color });
        } else {
            setEditingNote(null);
            setFormData({ title: '', content: '', color: 'pink' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingNote(null);
        setFormData({ title: '', content: '', color: 'pink' });
    };

    const handleSaveNote = async () => {
        if (!formData.title.trim()) return;

        try {
            if (editingNote) {
                // Update existing note
                const response = await fetch(`http://localhost:5000/api/notes/${editingNote._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const updatedNote = await response.json();
                setNotes(notes.map(note =>
                    note._id === updatedNote._id ? updatedNote : note
                ));
            } else {
                // Create new note
                const response = await fetch('http://localhost:5000/api/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, userId: user.id })
                });
                const newNote = await response.json();
                setNotes([newNote, ...notes]);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save note:', error);
        }
    };

    const handleDeleteNote = async (id) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await fetch(`http://localhost:5000/api/notes/${id}`, {
                    method: 'DELETE'
                });
                setNotes(notes.filter(note => note._id !== id));
            } catch (error) {
                console.error('Failed to delete note:', error);
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="animate-fade-up">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-display text-white mb-2 flex items-center gap-3">
                        <Sparkles className="text-primary" size={32} />
                        My Notes
                    </h2>
                    <p className="text-purple-200">Your personal space for thoughts and ideas</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-bold px-6 py-3 rounded-full shadow-[0_0_20px_rgba(255,110,199,0.4)] hover:shadow-[0_0_30px_rgba(255,110,199,0.6)] transition-all flex items-center gap-2 active:scale-95"
                >
                    <Plus size={20} />
                    Add Note
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-bg-card border border-purple-500/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-purple-400/50 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
            </div>

            {/* Notes Grid */}
            {isLoading ? (
                <div className="text-center py-20">
                    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-purple-300">Loading notes...</p>
                </div>
            ) : filteredNotes.length === 0 ? (
                <div className="text-center py-20">
                    <div className="bg-purple-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="text-purple-400" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        {searchQuery ? 'No notes found' : 'No notes yet'}
                    </h3>
                    <p className="text-purple-300 mb-6">
                        {searchQuery ? 'Try a different search term' : 'Start by creating your first note!'}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-full transition-all"
                        >
                            Create Note
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotes.map((note) => {
                        const colorScheme = colors[note.color];
                        return (
                            <div
                                key={note._id}
                                className={`bg-bg-card border-l-4 ${colorScheme.border} rounded-2xl p-6 hover:shadow-[0_0_30px_rgba(183,148,246,0.2)] transition-all group relative ${colorScheme.bg}`}
                            >
                                {/* Note Content */}
                                <h3 className="text-lg font-bold text-white mb-2 pr-16 line-clamp-2">{note.title}</h3>
                                <p className="text-purple-200 text-sm mb-4 line-clamp-4">{note.content}</p>
                                <p className="text-xs text-purple-400">{formatDate(note.updatedAt)}</p>

                                {/* Action Buttons */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(note)}
                                        className="bg-purple-900/50 hover:bg-primary p-2 rounded-lg text-purple-300 hover:text-white transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteNote(note._id)}
                                        className="bg-purple-900/50 hover:bg-red-500 p-2 rounded-lg text-purple-300 hover:text-white transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-card border border-purple-500/20 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-up">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-white">
                                {editingNote ? 'Edit Note' : 'Create New Note'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-purple-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-purple-200 font-bold mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter note title..."
                                    className="w-full bg-bg-input border border-purple-500/20 rounded-xl px-4 py-3 text-white placeholder-purple-400/50 focus:outline-none focus:border-primary/50 transition-colors"
                                    autoFocus
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-purple-200 font-bold mb-2">Content</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Write your note here..."
                                    rows={8}
                                    className="w-full bg-bg-input border border-purple-500/20 rounded-xl px-4 py-3 text-white placeholder-purple-400/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                />
                            </div>

                            {/* Color Picker */}
                            <div>
                                <label className="block text-purple-200 font-bold mb-3">Color</label>
                                <div className="flex gap-3">
                                    {Object.keys(colors).map((colorKey) => {
                                        const colorScheme = colors[colorKey];
                                        return (
                                            <button
                                                key={colorKey}
                                                onClick={() => setFormData({ ...formData, color: colorKey })}
                                                className={`w-12 h-12 rounded-full border-4 ${formData.color === colorKey
                                                    ? `${colorScheme.border} scale-110`
                                                    : 'border-transparent hover:scale-105'
                                                    } ${colorScheme.bg} transition-all`}
                                            >
                                                <div className={`w-full h-full rounded-full ${colorScheme.border.replace('border-', 'bg-')}`}></div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleSaveNote}
                                    disabled={!formData.title.trim()}
                                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-bold px-6 py-3 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <Save size={20} />
                                    {editingNote ? 'Update Note' : 'Save Note'}
                                </button>
                                <button
                                    onClick={handleCloseModal}
                                    className="px-6 py-3 rounded-full border-2 border-purple-500/30 text-purple-300 hover:border-purple-400 hover:text-white font-bold transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
