import { useState } from 'react';
import { ChevronLeft, Star, Zap, CheckCircle, XCircle, Award, Sparkles, PartyPopper } from 'lucide-react';

// Celebration Confetti Component
function Confetti() {
    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(50)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-3 h-3 animate-confetti"
                    style={{
                        left: `${Math.random() * 100}%`,
                        background: ['#f43f5e', '#8b5cf6', '#06b6d4', '#eab308', '#22c55e'][Math.floor(Math.random() * 5)],
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 2}s`,
                        borderRadius: Math.random() > 0.5 ? '50%' : '0'
                    }}
                />
            ))}
        </div>
    );
}

// Quiz Component
function BeginnerQuiz({ quiz, onComplete }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);

    const question = quiz[currentQuestion];
    const totalQuestions = quiz.length;

    const handleAnswer = (answerIndex) => {
        setSelectedAnswer(answerIndex);
        const correct = answerIndex === question.correctAnswer;
        setIsCorrect(correct);

        setTimeout(() => {
            const newAnswers = [...answers, { questionIndex: currentQuestion, answer: answerIndex, correct }];
            setAnswers(newAnswers);

            if (currentQuestion < totalQuestions - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
                setIsCorrect(null);
            } else {
                const score = Math.round((newAnswers.filter(a => a.correct).length / totalQuestions) * 100);
                onComplete(score);
            }
        }, 1500);
    };

    return (
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 max-w-2xl mx-auto border border-slate-700/50">
            {/* Progress */}
            <div className="flex items-center justify-between mb-6">
                <span className="text-slate-400 text-sm">Question {currentQuestion + 1} of {totalQuestions}</span>
                <div className="flex gap-1">
                    {[...Array(totalQuestions)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-8 h-2 rounded-full transition-all duration-300 ${i < currentQuestion
                                    ? answers[i]?.correct ? 'bg-green-500' : 'bg-red-500'
                                    : i === currentQuestion
                                        ? 'bg-purple-500'
                                        : 'bg-slate-700'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Question */}
            <h3 className="text-2xl font-bold text-white mb-8 text-center animate-fade-up">
                {question.question}
            </h3>

            {/* Options */}
            <div className="space-y-4">
                {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrectAnswer = index === question.correctAnswer;
                    const showFeedback = selectedAnswer !== null;

                    return (
                        <button
                            key={index}
                            onClick={() => selectedAnswer === null && handleAnswer(index)}
                            disabled={selectedAnswer !== null}
                            className={`
                w-full p-5 rounded-2xl text-left font-medium text-lg
                transition-all duration-300 transform
                ${selectedAnswer === null
                                    ? 'bg-slate-700/50 hover:bg-slate-700 hover:scale-102 border-2 border-transparent hover:border-purple-500'
                                    : isSelected
                                        ? isCorrectAnswer
                                            ? 'bg-green-500/20 border-2 border-green-500 scale-102'
                                            : 'bg-red-500/20 border-2 border-red-500 shake'
                                        : isCorrectAnswer && showFeedback
                                            ? 'bg-green-500/10 border-2 border-green-500/50'
                                            : 'bg-slate-700/30 border-2 border-transparent opacity-50'
                                }
                ${selectedAnswer === null ? 'cursor-pointer' : 'cursor-default'}
              `}
                        >
                            <div className="flex items-center justify-between">
                                <span className={showFeedback && isCorrectAnswer ? 'text-green-400' : 'text-white'}>
                                    {option}
                                </span>
                                {showFeedback && isSelected && (
                                    isCorrectAnswer
                                        ? <CheckCircle className="text-green-400 w-6 h-6 animate-bounce" />
                                        : <XCircle className="text-red-400 w-6 h-6" />
                                )}
                                {showFeedback && !isSelected && isCorrectAnswer && (
                                    <CheckCircle className="text-green-400/50 w-5 h-5" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Feedback */}
            {isCorrect !== null && (
                <div className={`mt-6 p-4 rounded-xl text-center animate-fade-up ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                    <span className={`text-lg font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? '🎉 Correct!' : '😅 Oops! Not quite.'}
                    </span>
                </div>
            )}
        </div>
    );
}

// Main Lesson Detail Component
export default function BeginnerLessonDetail({ lesson, userProgress, onBack, onComplete }) {
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [xpEarned, setXpEarned] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);
    const [newAchievements, setNewAchievements] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isCompleted = userProgress?.completedLessons?.some(
        cl => (cl.lessonId?._id || cl.lessonId) === lesson._id
    );

    const handleQuizComplete = async (score) => {
        setQuizScore(score);
        setQuizCompleted(true);
        setShowQuiz(false);

        if (score >= 70) {
            setIsSubmitting(true);
            try {
                const response = await fetch('http://localhost:5000/api/beginner/complete-lesson', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userProgress.userId,
                        lessonId: lesson._id,
                        quizScore: score
                    })
                });

                const data = await response.json();
                setXpEarned(data.xpEarned || lesson.xpReward);
                setNewAchievements(data.newAchievements || []);
                setShowCelebration(true);

                // Hide confetti after 4 seconds
                setTimeout(() => setShowCelebration(false), 4000);

                if (onComplete) onComplete(data);
            } catch (error) {
                console.error('Error completing lesson:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleStartQuiz = () => {
        setShowQuiz(true);
    };

    const getDifficultyLabel = (level) => {
        switch (level) {
            case 'easy': return { text: 'Easy', color: 'text-green-400', bg: 'bg-green-500/20' };
            case 'medium': return { text: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
            case 'hard': return { text: 'Challenging', color: 'text-red-400', bg: 'bg-red-500/20' };
            default: return { text: 'Easy', color: 'text-green-400', bg: 'bg-green-500/20' };
        }
    };

    const difficulty = getDifficultyLabel(lesson.difficultyLevel);

    return (
        <div className="animate-fade-up">
            {/* Celebration Confetti */}
            {showCelebration && <Confetti />}

            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors group"
            >
                <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                Back to Lessons
            </button>

            {/* Celebration Modal */}
            {quizCompleted && quizScore >= 70 && showCelebration && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-10 text-center max-w-md mx-4 animate-bounce-in">
                        <PartyPopper className="w-20 h-20 text-yellow-300 mx-auto mb-4 animate-bounce" />
                        <h2 className="text-4xl font-black text-white mb-2">Amazing!</h2>
                        <p className="text-white/80 text-lg mb-6">You completed the lesson!</p>

                        <div className="bg-white/20 rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-center gap-2 text-3xl font-bold text-yellow-300">
                                <Zap className="w-8 h-8" />
                                +{xpEarned} XP
                            </div>
                            <p className="text-white/70 mt-2">Score: {quizScore}%</p>
                        </div>

                        {newAchievements.length > 0 && (
                            <div className="mb-6">
                                <p className="text-white/80 text-sm mb-3">New Achievements:</p>
                                <div className="flex justify-center gap-4">
                                    {newAchievements.map(a => (
                                        <div key={a.id} className="bg-yellow-400 p-3 rounded-xl animate-pulse">
                                            <span className="text-3xl">{a.icon}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => { setShowCelebration(false); onBack(); }}
                            className="bg-white text-purple-600 font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform"
                        >
                            Continue Learning
                        </button>
                    </div>
                </div>
            )}

            {/* Failed Quiz Result */}
            {quizCompleted && quizScore < 70 && !showCelebration && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-6 text-center">
                    <h3 className="text-xl font-bold text-amber-400 mb-2">Almost there! 💪</h3>
                    <p className="text-slate-300 mb-4">
                        You scored {quizScore}%. You need 70% to pass. Review the lesson and try again!
                    </p>
                    <button
                        onClick={() => { setQuizCompleted(false); setShowQuiz(false); }}
                        className="bg-amber-500 text-white font-bold px-6 py-2 rounded-xl hover:bg-amber-400 transition-colors"
                    >
                        Review Lesson
                    </button>
                </div>
            )}

            {!showQuiz && !showCelebration ? (
                <>
                    {/* Lesson Header */}
                    <div className={`bg-gradient-to-br from-${lesson.color || 'purple-500'} to-pink-600 rounded-3xl p-8 mb-8 relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-60 h-60 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4" />

                        <div className="relative">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-6xl">{lesson.icon || '📚'}</div>
                                <div>
                                    <span className={`${difficulty.bg} ${difficulty.color} text-xs font-bold px-3 py-1 rounded-full`}>
                                        {difficulty.text}
                                    </span>
                                </div>
                            </div>

                            <h1 className="text-4xl font-black text-white mb-4">{lesson.title}</h1>
                            <p className="text-white/80 text-lg">{lesson.description}</p>

                            <div className="flex items-center gap-4 mt-6">
                                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                                    <Zap className="text-yellow-300 w-5 h-5" />
                                    <span className="text-white font-bold">{lesson.xpReward} XP</span>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => (
                                        <Star
                                            key={i}
                                            size={20}
                                            className={i <= { easy: 1, medium: 2, hard: 3 }[lesson.difficultyLevel]
                                                ? 'text-yellow-300 fill-yellow-300'
                                                : 'text-white/30'
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lesson Content */}
                    <div className="bg-slate-800/50 rounded-3xl p-8 mb-8 border border-slate-700/50">
                        <div
                            className="prose prose-invert prose-lg max-w-none
                prose-headings:text-white prose-p:text-slate-300
                prose-strong:text-purple-400 prose-a:text-pink-400"
                            dangerouslySetInnerHTML={{ __html: lesson.content }}
                        />
                    </div>

                    {/* Fun Fact */}
                    {lesson.funFact && (
                        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-6 mb-8 border border-amber-500/30">
                            <div className="flex items-start gap-4">
                                <span className="text-4xl">💡</span>
                                <div>
                                    <h4 className="font-bold text-amber-400 mb-1">Fun Fact!</h4>
                                    <p className="text-slate-300">{lesson.funFact}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    {isCompleted ? (
                        <div className="bg-green-500/20 rounded-2xl p-6 text-center border border-green-500/30">
                            <CheckCircle className="text-green-400 w-12 h-12 mx-auto mb-3" />
                            <h3 className="text-xl font-bold text-green-400">Lesson Completed!</h3>
                            <p className="text-slate-400 mt-2">Great job! You've already earned XP for this lesson.</p>
                        </div>
                    ) : lesson.quiz && lesson.quiz.length > 0 ? (
                        <button
                            onClick={handleStartQuiz}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl py-5 rounded-2xl hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-102 transition-all flex items-center justify-center gap-3"
                        >
                            <Award className="w-7 h-7" />
                            Take Quiz & Earn {lesson.xpReward} XP!
                            <Sparkles className="w-6 h-6 animate-pulse" />
                        </button>
                    ) : (
                        <button
                            onClick={() => handleQuizComplete(100)}
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xl py-5 rounded-2xl hover:shadow-2xl hover:shadow-green-500/30 hover:scale-102 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-7 h-7" />
                                    Mark as Complete & Earn {lesson.xpReward} XP!
                                </>
                            )}
                        </button>
                    )}
                </>
            ) : showQuiz && (
                <BeginnerQuiz quiz={lesson.quiz} onComplete={handleQuizComplete} />
            )}

            <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-confetti { animation: confetti 3s ease-out forwards; }
        .shake { animation: shake 0.5s ease-in-out; }
        .animate-bounce-in { animation: bounce-in 0.6s ease-out; }
      `}</style>
        </div>
    );
}
