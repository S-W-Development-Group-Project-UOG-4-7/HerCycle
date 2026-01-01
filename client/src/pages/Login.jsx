import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error?.message || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-pink/20 via-primary-purple/20 to-accent-teal/20 flex items-center justify-center px-4">
      <div className="bg-white rounded-card shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-header font-bold text-primary-pink mb-2">
            Welcome Back! 👋
          </h1>
          <p className="text-text-secondary">Login to continue your learning journey</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-text-primary font-header font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-pink focus:outline-none transition-colors"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-text-primary font-header font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-pink focus:outline-none transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-pink text-white py-3 rounded-full font-header font-bold text-lg hover:bg-primary-pink/90 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login 🚀'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-secondary">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-pink font-semibold hover:underline">
              Sign up here
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-primary-purple text-sm hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
