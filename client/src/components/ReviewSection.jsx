import { useState, useEffect } from 'react';
import { Star, X, Loader } from 'lucide-react';

export default function ReviewSection({ user }) {
    const [reviews, setReviews] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        rating: 5,
        title: '',
        comment: ''
    });

    // New states for filtering and editing
    const [filterRating, setFilterRating] = useState(0); // 0 = all ratings
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, highest, lowest
    const [editingReview, setEditingReview] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/reviews/approved');
            const data = await response.json();
            console.log('📥 Fetched reviews from API:', data.length, 'reviews');
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setMessage('Please login to submit a review');
            return;
        }

        setIsSubmitting(true);
        setMessage('');

        try {
            // Handle both _id and id fields for user
            const userId = user._id || user.id;

            const response = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    userName: user.name,
                    userRole: user.role,
                    ...formData
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setFormData({ rating: 5, title: '', comment: '' });
                setShowForm(false);
                // Refresh reviews to show the new one immediately
                fetchReviews();
                setTimeout(() => setMessage(''), 5000);
            } else {
                setMessage(data.message || 'Failed to submit review');
            }
        } catch {
            setMessage('Unable to connect to server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditReview = async (e) => {
        e.preventDefault();

        if (!editingReview) return;

        setIsSubmitting(true);
        setMessage('');

        try {
            const userId = user._id || user.id;

            const response = await fetch(`http://localhost:5000/api/reviews/${editingReview._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    rating: editingReview.rating,
                    title: editingReview.title,
                    comment: editingReview.comment
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Review updated successfully!');
                setShowEditModal(false);
                setEditingReview(null);
                fetchReviews();
                setTimeout(() => setMessage(''), 5000);
            } else {
                setMessage(data.message || 'Failed to update review');
            }
        } catch {
            setMessage('Unable to connect to server.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (review) => {
        setEditingReview({ ...review });
        setShowEditModal(true);
    };

    // Filter and sort reviews
    const getFilteredAndSortedReviews = () => {
        let filtered = [...reviews];

        // Filter by rating
        if (filterRating > 0) {
            filtered = filtered.filter(r => r.rating === filterRating);
        }

        // Sort
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'highest':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'lowest':
                filtered.sort((a, b) => a.rating - b.rating);
                break;
            default:
                break;
        }

        return filtered;
    };

    const StarRating = ({ rating, interactive, onChange }) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={interactive ? 28 : 20}
                        className={`${star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-600'
                            } ${interactive ? 'cursor-pointer transition-all hover:scale-110' : ''}`}
                        onClick={() => interactive && onChange(star)}
                    />
                ))}
            </div>
        );
    };

    return (
        <section className="max-w-7xl mx-auto py-20 px-6 relative z-20">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                    What Our Community Says
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
                    Real experiences from real users who trust HerCycle
                </p>

                {user ? (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-gradient-to-r from-primary to-secondary text-white font-bold px-8 py-3 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-105"
                    >
                        {showForm ? 'Cancel' : 'Share Your Experience'}
                    </button>
                ) : (
                    <p className="text-slate-500 text-sm italic">Login to share your review</p>
                )}
            </div>

            {/* Message Display */}
            {message && (
                <div className={`max-w-2xl mx-auto mb-8 p-4 rounded-xl ${message.includes('success') || message.includes('updated')
                    ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                    : 'bg-red-500/20 border border-red-500/50 text-red-300'
                    }`}>
                    {message}
                </div>
            )}

            {/* Filter Controls */}
            {reviews.length > 0 && (
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            {/* Rating Filter */}
                            <div className="flex items-center gap-3">
                                <span className="text-slate-400 text-sm font-medium">Filter:</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilterRating(0)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filterRating === 0
                                            ? 'bg-primary text-white'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                    >
                                        All
                                    </button>
                                    {[5, 4, 3, 2, 1].map((rating) => (
                                        <button
                                            key={rating}
                                            onClick={() => setFilterRating(rating)}
                                            className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-1 ${filterRating === rating
                                                ? 'bg-yellow-500 text-slate-900'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            {rating} <Star size={14} className={filterRating === rating ? 'fill-slate-900' : ''} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-3">
                                <span className="text-slate-400 text-sm font-medium">Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-primary focus:outline-none"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="highest">Highest Rating</option>
                                    <option value="lowest">Lowest Rating</option>
                                </select>
                            </div>
                        </div>

                        {/* Results count */}
                        <div className="text-center mt-4 text-slate-500 text-sm">
                            Showing {getFilteredAndSortedReviews().length} of {reviews.length} reviews
                        </div>
                    </div>
                </div>
            )}

            {/* Review Form */}
            {showForm && user && (
                <div className="max-w-2xl mx-auto mb-12 bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
                    <h3 className="text-2xl font-bold text-white mb-6">Share Your Review</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-white font-bold mb-3 block">Rating</label>
                            <StarRating
                                rating={formData.rating}
                                interactive={true}
                                onChange={(rating) => setFormData({ ...formData, rating })}
                            />
                        </div>

                        <div>
                            <label className="text-white font-bold mb-2 block">Title</label>
                            <input
                                type="text"
                                required
                                maxLength={100}
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-primary focus:outline-none"
                                placeholder="Summarize your experience..."
                            />
                        </div>

                        <div>
                            <label className="text-white font-bold mb-2 block">Your Review</label>
                            <textarea
                                required
                                maxLength={500}
                                rows={4}
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-primary focus:outline-none resize-none"
                                placeholder="Tell us about your experience with HerCycle..."
                            />
                            <p className="text-slate-500 text-sm mt-2">
                                {formData.comment.length}/500 characters
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Review'
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Reviews Display */}
            {getFilteredAndSortedReviews().length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredAndSortedReviews().map((review) => {
                        const isOwnReview = user && (user._id === review.userId || user.id === review.userId);

                        return (
                            <div
                                key={review._id}
                                className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-primary/50 transition-all relative"
                            >
                                {/* Edit button for own reviews */}
                                {isOwnReview && (
                                    <button
                                        onClick={() => openEditModal(review)}
                                        className="absolute top-4 right-4 text-slate-500 hover:text-primary transition-colors"
                                        title="Edit review"
                                    >
                                        <X size={18} className="rotate-45" />
                                    </button>
                                )}

                                <div className="flex justify-between items-start mb-4">
                                    <StarRating rating={review.rating} interactive={false} />
                                    <span className="text-xs text-slate-500">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h4 className="text-white font-bold text-lg mb-2">{review.title}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                    {review.comment}
                                </p>

                                <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                                        {review.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{review.userName}</p>
                                        <p className="text-xs text-slate-500 capitalize">{review.userRole}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center text-slate-500 py-12">
                    <p>{filterRating > 0 ? `No ${filterRating}-star reviews found` : 'No reviews yet. Be the first to share your experience!'}</p>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingReview && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">Edit Your Review</h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingReview(null);
                                }}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleEditReview} className="space-y-6">
                            <div>
                                <label className="text-white font-bold mb-3 block">Rating</label>
                                <StarRating
                                    rating={editingReview.rating}
                                    interactive={true}
                                    onChange={(rating) => setEditingReview({ ...editingReview, rating })}
                                />
                            </div>

                            <div>
                                <label className="text-white font-bold mb-2 block">Title</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={100}
                                    value={editingReview.title}
                                    onChange={(e) => setEditingReview({ ...editingReview, title: e.target.value })}
                                    className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-primary focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-white font-bold mb-2 block">Your Review</label>
                                <textarea
                                    required
                                    maxLength={500}
                                    rows={4}
                                    value={editingReview.comment}
                                    onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                                    className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-primary focus:outline-none resize-none"
                                />
                                <p className="text-slate-500 text-sm mt-2">
                                    {editingReview.comment.length}/500 characters
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Updating...' : 'Update Review'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingReview(null);
                                    }}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
