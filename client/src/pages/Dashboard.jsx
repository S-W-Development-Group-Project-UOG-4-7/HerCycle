import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModules } from '../context/ModuleContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { modules, fetchModules } = useModules();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    percentage: 0,
  });

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    if (modules.length > 0) {
      const completed = modules.filter(m => m.userProgress === 'completed').length;
      const inProgress = modules.filter(m => m.userProgress === 'in-progress').length;
      const percentage = Math.round((completed / modules.length) * 100);

      setStats({
        total: modules.length,
        completed,
        inProgress,
        percentage,
      });
    }
  }, [modules]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-card shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-header font-bold text-primary-pink mb-2">
                Welcome back, {user?.username}! 🎉
              </h1>
              <p className="text-text-secondary">Ready to continue your learning journey?</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-6 py-2 rounded-full font-header hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary-pink to-primary-purple text-white p-6 rounded-card shadow-lg">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-sm opacity-90">Total Points</div>
            <div className="text-4xl font-bold font-header">{user?.totalPoints || 0}</div>
          </div>

          <div className="bg-gradient-to-br from-accent-teal to-success text-white p-6 rounded-card shadow-lg">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-sm opacity-90">Current Level</div>
            <div className="text-4xl font-bold font-header">Level {user?.currentLevel || 1}</div>
          </div>

          <div className="bg-gradient-to-br from-accent-orange to-yellow-500 text-white p-6 rounded-card shadow-lg">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-sm opacity-90">Streak</div>
            <div className="text-4xl font-bold font-header">{user?.currentStreak || 0} days</div>
          </div>
        </div>

        <div className="bg-white rounded-card shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-header font-bold text-primary-purple">
              Your Learning Progress
            </h2>
            <Link
              to="/modules"
              className="bg-primary-pink text-white px-6 py-3 rounded-full font-header font-bold hover:bg-primary-pink/90 transform hover:scale-105 transition-all shadow-lg"
            >
              View All Modules →
            </Link>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-header font-semibold text-text-primary">
                Overall Completion
              </span>
              <span className="font-header font-bold text-primary-pink text-xl">
                {stats.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-primary-pink to-primary-purple h-4 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl mb-1">📚</div>
              <div className="text-text-secondary text-sm">Total Modules</div>
              <div className="text-2xl font-bold font-header text-text-primary">
                {stats.total}
              </div>
            </div>
            <div className="bg-success/10 p-4 rounded-lg">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-success text-sm font-semibold">Completed</div>
              <div className="text-2xl font-bold font-header text-success">
                {stats.completed}
              </div>
            </div>
            <div className="bg-accent-orange/10 p-4 rounded-lg">
              <div className="text-2xl mb-1">📝</div>
              <div className="text-accent-orange text-sm font-semibold">In Progress</div>
              <div className="text-2xl font-bold font-header text-accent-orange">
                {stats.inProgress}
              </div>
            </div>
          </div>

          {stats.completed === stats.total && stats.total > 0 && (
            <div className="bg-gradient-to-r from-primary-pink to-primary-purple text-white p-6 rounded-lg text-center">
              <div className="text-4xl mb-2">🎊</div>
              <h3 className="text-2xl font-header font-bold mb-2">
                Congratulations, Champion!
              </h3>
              <p className="text-lg">
                You've completed all modules! You're a Hercycle Health Champion!
              </p>
            </div>
          )}

          {modules.length > 0 && stats.completed < stats.total && (
            <div className="mt-6">
              <h3 className="font-header font-bold text-text-primary mb-4">
                Recent Modules
              </h3>
              <div className="grid gap-4">
                {modules.slice(0, 3).map((module) => (
                  <Link
                    key={module._id}
                    to={`/modules/${module._id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{module.icon}</div>
                      <div>
                        <h4 className="font-header font-semibold text-text-primary">
                          {module.title}
                        </h4>
                        <p className="text-sm text-text-secondary">{module.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          module.userProgress === 'completed'
                            ? 'bg-success text-white'
                            : module.userProgress === 'in-progress'
                            ? 'bg-accent-orange text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}
                      >
                        {module.userProgress === 'completed'
                          ? 'Completed'
                          : module.userProgress === 'in-progress'
                          ? 'In Progress'
                          : 'Not Started'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
