
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';
import Toast from '../components/Toast';

export default function Auth({ onLogin, isRegister }) {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  
  const handleRegisterSubmit = async (name, email, password, dob) => {
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, dob }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setToast({ message: "Registration successful! Please log in.", type: "success" });
        setTimeout(() => navigate('/login'), 1500); // Delay switch to let toast show
      } else {
        setToast({ message: data.message || "Registration failed", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Something went wrong", type: "error" });
    }
  };

  const handleLoginSubmit = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setToast({ message: "Login successful!", type: "success" });
        setTimeout(() => onLogin(data), 1000); // Pass user data up to App.jsx
      } else {
        setToast({ message: data.message || "Login failed", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Login error", type: "error" });
    }
  };

  return (
    <>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      {!isRegister ? (
        <Login 
          onLogin={handleLoginSubmit} 
        />
      ) : (
        <Register 
          onRegister={handleRegisterSubmit} 
        />
      )}
    </>
  );
}