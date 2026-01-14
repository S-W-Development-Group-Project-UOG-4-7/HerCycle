// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GradientBackground from "./components/GradientBackground";
import Landing from "./pages/LandingPage/LandingPage";
import Fundraising from "./pages/Fundraising/Fundraising";
import Adminpanel from "./pages/Admin/AdminPanel";
import FundraisingAdminPanel from './pages/Admin/FundraisingAdminPanel';
import PaymentGateway from './components/PaymentGateway/PaymentGateway';
import DonationSuccess from './pages/DonationSuccess/DonationSuccess';
// Add these imports
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import DoctorDashboard from './pages/Doctor/Dashboard';

function App() {
  return (
    <Router>
      <GradientBackground>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/fundraising" element={<Fundraising />} />
          <Route path="/admin" element={<Adminpanel />} />
          <Route path="/adminF" element={<FundraisingAdminPanel />} />
          <Route path="/payment" element={<PaymentGateway />} />
          <Route path="/donation-success" element={<DonationSuccess />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor-pending" element={<DoctorDashboard pending={true} />} />
        </Routes>
      </GradientBackground>
    </Router>
  );
}

export default App;