import { useEffect, useState } from 'react';
import { useModules } from '../context/ModuleContext';
import ModuleCard from '../components/modules/ModuleCard';

const ModulesPage = () => {
  const { modules, loading, fetchModules } = useModules();
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const category = selectedCategory === 'all' ? null : selectedCategory;
    fetchModules(category);
  }, [selectedCategory]);

  const categories = [
    { value: 'all', label: 'All Modules', icon: '📚' },
    { value: 'body', label: 'Body', icon: '🌟' },
    { value: 'puberty', label: 'Puberty', icon: '🦋' },
    { value: 'periods', label: 'Periods', icon: '🌸' },
    { value: 'hygiene', label: 'Hygiene', icon: '🧼' },
    { value: 'emotions', label: 'Emotions', icon: '❤️' },
    { value: 'relationships', label: 'Relationships', icon: '🤝' },
    { value: 'safety', label: 'Safety', icon: '🛡️' },
    { value: 'general', label: 'General', icon: '❓' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-pink mx-auto"></div>
          <p className="mt-4 text-text-primary font-header text-lg">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-pink/10 via-primary-purple/10 to-accent-teal/10">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-header font-bold text-primary-pink mb-3">
            Learning Modules 📚
          </h1>
          <p className="text-xl text-text-secondary">
            Explore all 12 fun and educational modules!
          </p>
        </div>

        <div className="bg-white rounded-card shadow-lg p-6 mb-8">
          <h3 className="font-header font-semibold text-text-primary mb-3">Filter by Category:</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full font-header font-semibold transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-primary-pink text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {modules.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-text-secondary">No modules found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <ModuleCard key={module._id} module={module} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="bg-white rounded-card shadow-lg p-6 inline-block">
            <h3 className="font-header font-bold text-primary-purple text-lg mb-2">
              Complete all modules to become a Health Champion! 🏆
            </h3>
            <p className="text-text-secondary">
              Each module earns you 50 points. Complete quizzes for bonus points!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulesPage;
