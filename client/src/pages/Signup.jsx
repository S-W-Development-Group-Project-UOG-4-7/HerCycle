import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    birthday: '',
    email: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 10 || age > 18) {
      setError('Age must be between 10 and 18');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...signupData } = formData;
    if (!signupData.email) delete signupData.email;
    if (!signupData.gender) delete signupData.gender;

    const result = await signup(signupData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error?.message || 'Signup failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-pink/20 via-primary-purple/20 to-accent-teal/20 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-card shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-header font-bold text-primary-pink mb-2">
            Join Hercycle! 🌟
          </h1>
          <p className="text-text-secondary">Start your learning journey today</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-primary font-header font-semibold mb-2">
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={20}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-pink focus:outline-none transition-colors"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-text-primary font-header font-semibold mb-2">
                Age * (10-18)
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min={10}
                max={18}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-pink focus:outline-none transition-colors"
                placeholder="Your age"
              />
            </div>
          </div>

          <div>
            <label className="block text-text-primary font-header font-semibold mb-2">
              Birthday *
            </label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-pink focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-text-primary font-header font-semibold mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-pink focus:outline-none transition-colors"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-text-primary font-header font-semibold mb-2">
              Gender (Optional)
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-pink focus:outline-none transition-colors"
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-primary font-header font-semibold mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-pink focus:outline-none transition-colors"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-text-primary font-header font-semibold mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-pink focus:outline-none transition-colors"
                placeholder="Re-enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-pink text-white py-3 rounded-full font-header font-bold text-lg hover:bg-primary-pink/90 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Creating Account...' : 'Sign Up 🚀'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-pink font-semibold hover:underline">
              Login here
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

export default Signup;
