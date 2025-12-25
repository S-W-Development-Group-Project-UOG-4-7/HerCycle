import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PublicNavbar from './components/PublicNavbar';

function AppContent() {
  // Logic: Only run state initialization once
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('proton_hercycle_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const location = useLocation();

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('proton_hercycle_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('proton_hercycle_user');
  };

  // Helper: Show PublicNavbar on public pages (landing, about)
  // Show it on landing even if logged in, so users can navigate
  const isPublicPage = location.pathname === '/' || location.pathname === '/about';
  const isDashboard = location.pathname === '/dashboard';
  const showPublicNav = isPublicPage || (!isDashboard && !user);

  return (
    <>
      {showPublicNav && <PublicNavbar user={user} onLogout={handleLogout} />}

      <Routes>
        {/* PUBLIC ROUTES - Accessible to everyone */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* AUTH ROUTES */}
        {/* If user is logged in, redirect Login/Signup to Dashboard */}
        <Route path="/login" element={!user ? <AuthPage isRegister={false} onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <AuthPage isRegister={true} onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />

        {/* PROTECTED ROUTE */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
      </Routes>
    </>
  );
}

// Wrapper to provide Router context
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}