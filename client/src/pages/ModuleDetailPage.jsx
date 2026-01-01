import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useModules } from '../context/ModuleContext';
import { useAuth } from '../context/AuthContext';

const ModuleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentModule, loading, fetchModuleById, startModule, completeModule } = useModules();
  const { user } = useAuth();
  const [completing, setCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  useEffect(() => {
    fetchModuleById(id);
  }, [id]);

  useEffect(() => {
    if (currentModule && currentModule.userProgress === 'not-started') {
      startModule(id);
    }
  }, [currentModule]);

  const handleComplete = async () => {
    setCompleting(true);
    const result = await completeModule(id);

    if (result.success) {
      setEarnedPoints(result.data.pointsEarned || 0);
      if (result.data.pointsEarned > 0) {
        setShowCelebration(true);
        setTimeout(() => {
          setShowCelebration(false);
          navigate('/modules');
        }, 3000);
      } else {
        navigate('/modules');
      }
    }

    setCompleting(false);
  };

  if (loading || !currentModule) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-pink mx-auto"></div>
          <p className="mt-4 text-text-primary font-header text-lg">Loading module...</p>
        </div>
      </div>
    );
  }

  const module = currentModule;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-pink/10 via-primary-purple/10 to-accent-teal/10">
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-card shadow-2xl p-8 max-w-md mx-4 text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-header font-bold text-primary-pink mb-3">
              Congratulations!
            </h2>
            <p className="text-xl text-text-primary mb-2">
              You earned {earnedPoints} points!
            </p>
            <p className="text-text-secondary">
              Keep learning to level up!
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to="/modules"
          className="inline-flex items-center text-primary-purple hover:text-primary-pink font-header font-semibold mb-6 transition-colors"
        >
          ← Back to Modules
        </Link>

        <div className="bg-white rounded-card shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{module.icon}</div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary-purple/10 text-primary-purple text-sm px-3 py-1 rounded-full font-semibold">
                    Module {module.moduleNumber}
                  </span>
                  <span className="bg-accent-teal/10 text-accent-teal text-sm px-3 py-1 rounded-full font-semibold capitalize">
                    {module.category}
                  </span>
                </div>
                <h1 className="text-4xl font-header font-bold text-primary-pink">
                  {module.title}
                </h1>
                <p className="text-text-secondary mt-2">{module.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-text-secondary mb-6 pb-6 border-b">
            <div className="flex items-center gap-2">
              <span>⏱️</span>
              <span className="font-semibold">{module.estimatedMinutes} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⭐</span>
              <span className="font-semibold">{module.pointsValue} points</span>
            </div>
            {module.userProgress && (
              <div className="flex items-center gap-2">
                <span>📊</span>
                <span className="font-semibold capitalize">
                  {module.userProgress.replace('-', ' ')}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {module.content.sections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <div key={index}>
                  {section.type === 'text' && (
                    <div>
                      <h2 className="text-2xl font-header font-bold text-primary-purple mb-3">
                        {section.heading}
                      </h2>
                      <p className="text-text-primary leading-relaxed text-lg">
                        {section.content}
                      </p>
                    </div>
                  )}

                  {section.type === 'tip' && (
                    <div className="bg-accent-teal/10 border-l-4 border-accent-teal p-4 rounded">
                      <h3 className="font-header font-bold text-accent-teal mb-2 flex items-center gap-2">
                        💡 {section.heading}
                      </h3>
                      <p className="text-text-primary">{section.content}</p>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {module.keyTakeaways && module.keyTakeaways.length > 0 && (
            <div className="mt-8 bg-primary-pink/10 rounded-lg p-6">
              <h3 className="text-2xl font-header font-bold text-primary-pink mb-4 flex items-center gap-2">
                🎯 Key Takeaways
              </h3>
              <ul className="space-y-2">
                {module.keyTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-primary-pink text-xl">✓</span>
                    <span className="text-text-primary text-lg">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <Link
            to="/modules"
            className="px-8 py-3 rounded-full font-header font-bold text-primary-purple border-2 border-primary-purple hover:bg-primary-purple hover:text-white transition-all"
          >
            Back to Modules
          </Link>

          <button
            onClick={handleComplete}
            disabled={completing || module.userProgress === 'completed'}
            className={`px-8 py-3 rounded-full font-header font-bold text-white transition-all transform hover:scale-105 ${
              module.userProgress === 'completed'
                ? 'bg-success cursor-default'
                : 'bg-primary-pink hover:bg-primary-pink/90 shadow-lg'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {completing
              ? 'Completing...'
              : module.userProgress === 'completed'
              ? '✓ Completed'
              : 'Mark as Complete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetailPage;
