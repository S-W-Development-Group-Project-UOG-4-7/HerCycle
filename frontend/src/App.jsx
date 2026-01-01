import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Contact from "./pages/Contact.jsx";
import About from "./pages/About.jsx";
import "./index.css";
import "./App.css";
import FeedbackForm from "./components/FeedbackForm";
import FeedbackDisplay from "./components/FeedbackDisplay";
import Features from "./pages/Features";
import StaffLoginModal from "./components/StaffLoginModal";
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <Router>
      {/* Add a login button somewhere */}
      <button 
        onClick={() => setShowLoginModal(true)}
        style={{position: 'fixed', top: '20px', right: '20px', zIndex: 1000}}
      >
        Staff Login
      </button>

      {showLoginModal && (
        <StaffLoginModal onClose={() => setShowLoginModal(false)} />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/feedbacks" element={<FeedbackDisplay />} />
        <Route path="/features" element={<Features />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}