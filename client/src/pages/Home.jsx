import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-pink/20 via-primary-purple/20 to-accent-teal/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-header font-bold text-primary-pink mb-6">
            Welcome to Hercycle! 🌸
          </h1>
          <p className="text-2xl text-text-primary mb-8 font-body">
            Your friendly guide to understanding your body, periods, and growing up!
          </p>
          <p className="text-lg text-text-secondary mb-12 max-w-2xl mx-auto">
            Learn about puberty, body changes, and sex education in a fun, safe, and supportive environment.
            Earn points, unlock badges, and become a health champion!
          </p>

          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-primary-pink text-white px-8 py-4 rounded-full text-xl font-header font-bold hover:bg-primary-pink/90 transform hover:scale-105 transition-all shadow-lg"
              >
                Go to Dashboard 🎯
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-primary-pink text-white px-8 py-4 rounded-full text-xl font-header font-bold hover:bg-primary-pink/90 transform hover:scale-105 transition-all shadow-lg"
                >
                  Get Started 🚀
                </Link>
                <Link
                  to="/login"
                  className="bg-white text-primary-pink border-2 border-primary-pink px-8 py-4 rounded-full text-xl font-header font-bold hover:bg-primary-pink/10 transform hover:scale-105 transition-all shadow-lg"
                >
                  Login 👋
                </Link>
              </>
            )}
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-card shadow-lg">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-header font-bold text-primary-purple mb-2">
                12 Fun Modules
              </h3>
              <p className="text-text-secondary">
                Learn about puberty, periods, hygiene, emotions, and more!
              </p>
            </div>
            <div className="bg-white p-6 rounded-card shadow-lg">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-header font-bold text-primary-purple mb-2">
                Gamified Learning
              </h3>
              <p className="text-text-secondary">
                Earn points, level up, and unlock cool badges as you learn!
              </p>
            </div>
            <div className="bg-white p-6 rounded-card shadow-lg">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-header font-bold text-primary-purple mb-2">
                Safe & Friendly
              </h3>
              <p className="text-text-secondary">
                Age-appropriate content designed just for kids 10-18!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
