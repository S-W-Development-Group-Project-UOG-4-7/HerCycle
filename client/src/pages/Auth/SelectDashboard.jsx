import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SelectDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    const role = userData.role || userData.user_type;
    if (role !== 'doctor') {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '50px 40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#1a1a1b', fontSize: '28px' }}>
          Welcome, Doctor
        </h1>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '15px' }}>
          Choose which dashboard you'd like to open
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={() => navigate('/doctor-dashboard')}
            style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 15px rgba(219,39,119,0.3)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(219,39,119,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(219,39,119,0.3)'; }}
          >
            <span style={{ fontSize: '32px' }}>🩺</span>
            <div style={{ textAlign: 'left' }}>
              <div>Doctor Dashboard</div>
              <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: 400 }}>
                Manage articles, consultations & patients
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '20px',
              background: 'white',
              color: '#333',
              border: '2px solid #e0e0e0',
              borderRadius: '14px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              transition: 'transform 0.2s, border-color 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#db2777'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
          >
            <span style={{ fontSize: '32px' }}>👥</span>
            <div style={{ textAlign: 'left' }}>
              <div>Community Dashboard</div>
              <div style={{ fontSize: '12px', color: '#888', fontWeight: 400 }}>
                Browse articles, comment & interact with community
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectDashboard;
