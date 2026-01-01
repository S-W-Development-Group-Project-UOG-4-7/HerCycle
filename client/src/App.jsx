import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ModuleProvider } from './context/ModuleContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ModulesPage from './pages/ModulesPage';
import ModuleDetailPage from './pages/ModuleDetailPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ModuleProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/modules"
              element={
                <ProtectedRoute>
                  <ModulesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/modules/:id"
              element={
                <ProtectedRoute>
                  <ModuleDetailPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ModuleProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
