import { Link } from 'react-router-dom';

const ModuleCard = ({ module }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'in-progress':
        return 'bg-accent-orange';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed ✓';
      case 'in-progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  return (
    <Link to={`/modules/${module._id}`} className="block">
      <div className="bg-white rounded-card shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 p-6 h-full border-2 border-transparent hover:border-primary-pink">
        <div className="flex justify-between items-start mb-4">
          <div className="text-5xl mb-2">{module.icon}</div>
          <div className={`${getStatusColor(module.userProgress)} text-white text-xs px-3 py-1 rounded-full font-semibold`}>
            {getStatusText(module.userProgress)}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="bg-primary-purple/10 text-primary-purple text-xs px-2 py-1 rounded-full font-semibold">
            Module {module.moduleNumber}
          </span>
          <span className="bg-accent-teal/10 text-accent-teal text-xs px-2 py-1 rounded-full font-semibold capitalize">
            {module.category}
          </span>
        </div>

        <h3 className="text-xl font-header font-bold text-text-primary mb-2">
          {module.title}
        </h3>

        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
          {module.description}
        </p>

        <div className="flex items-center justify-between text-sm text-text-secondary">
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{module.estimatedMinutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span>{module.pointsValue} pts</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ModuleCard;
