import { useState } from 'react';
import { HelpCircle, ArrowRight, Trophy, XCircle, RefreshCw } from 'lucide-react';

export default function QuizModal({ quiz, onClose, onPass }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  if (!quiz || quiz.length === 0) return null;
  const q = quiz[currentQuestion];
  if (!q) return null;

  const handleNext = () => {
    let newScore = score;
    let newMistakes = mistakes;

    if (selectedOption === q.correctAnswer) {
      newScore = score + 1;
      setScore(newScore);
    } else {
      newMistakes = mistakes + 1;
      setMistakes(newMistakes);
    }

    // 1. Check Failure immediately
    if (newMistakes > 1) {
      setHasFailed(true);
      return; 
    }

    // 2. Check Finish
    if (currentQuestion === quiz.length - 1) {
      setIsFinished(true); // Switch to success screen
      onPass();           
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setScore(0);
    setMistakes(0);
    setHasFailed(false);
    setIsFinished(false);
  };

  // --- FAILURE SCREEN ---
  if (hasFailed) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-bg-card border border-red-900/50 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-fade-up text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
           <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-red-500/30">
            <XCircle className="text-red-500 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold font-display text-white mb-2">Quiz Failed</h2>
          <p className="text-slate-400 mb-6">You made <span className="text-red-400 font-bold">{mistakes} mistakes</span>. The limit is 1.</p>
          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 hover:bg-slate-800 font-bold">Close</button>
            <button onClick={handleRetry} className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
              <RefreshCw size={18} /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- SUCCESS SCREEN ---
  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-bg-card border border-green-900/50 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-fade-up text-center relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
          <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Trophy className="text-yellow-400 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold font-display text-white mb-2">Module Completed!</h2>
          <p className="text-slate-400 mb-6">Great job! You passed the knowledge check.</p>
          <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700">
            <span className="text-slate-500 uppercase text-xs font-bold tracking-widest">Final Score</span>
            <div className="text-5xl font-black text-green-400 mt-2">
              {score} <span className="text-2xl text-slate-500">/ {quiz.length}</span>
            </div>
          </div>   
          <button onClick={onClose} className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-4 rounded-xl shadow-lg transition-all">
            Continue Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- QUESTION SCREEN ---
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-card border border-slate-700 w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-fade-up relative">
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <HelpCircle className="text-primary w-8 h-8" />
            <h2 className="text-2xl font-bold font-display text-white">Quiz Time</h2>
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full">
            Question {currentQuestion + 1} / {quiz.length}
          </span>
        </div>

        <p className="text-lg text-white mb-6 font-medium leading-relaxed font-sans">
          {q.question}
        </p>

        <div className="space-y-3 mb-8">
          {q.options.map((opt, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center group cursor-pointer ${
                selectedOption === index 
                  ? 'bg-primary/20 border-primary text-white shadow-[0_0_10px_rgba(236,72,153,0.2)]' 
                  : 'bg-bg-input border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
              }`}
            >
              <span className="font-sans font-medium">{opt}</span>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selectedOption === index ? 'border-primary bg-primary' : 'border-slate-500'
              }`}>
                {selectedOption === index && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 hover:bg-slate-800 font-bold transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`flex-1 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              selectedOption === null ? 'bg-slate-700 opacity-50 cursor-not-allowed' : 'bg-secondary hover:bg-secondary-dark shadow-lg'
            }`}
          >
            {currentQuestion === quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}