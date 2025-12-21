import React, { useState, useEffect } from "react";
import './Register.css';

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    height: '',
    weight: '',
    school: '',
    birthday: '',
    grade: '',
    gender: ''
  });

  // Generate floating hearts
  const generateHearts = () => {
    const hearts = [];
    for (let i = 0; i < 8; i++) {
      hearts.push({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 15}s`,
        size: `${Math.random() * 15 + 10}px`,
        opacity: Math.random() * 0.2 + 0.1
      });
    }
    return hearts;
  };

  const [hearts] = useState(generateHearts());
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenderChange = (gender) => {
    setFormData({
      ...formData,
      gender
    });
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registration data:', formData);
    // Here you would typically send the data to your backend
    
    // Show success animation
    setIsSubmitted(true);
    setTimeout(() => {
      alert('Registration successful! Welcome to HerCycle!');
      // Redirect to dashboard or login page
      window.location.href = '/login';
    }, 2000);
  };

  const steps = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "School Details" },
    { number: 3, title: "Health Info" }
  ];

  return (
    <div className="register-container">
      {/* Floating Hearts Background */}
      <div className="floating-hearts">
        {hearts.map(heart => (
          <div
            key={heart.id}
            className="heart"
            style={{
              left: heart.left,
              animationDelay: heart.delay,
              fontSize: heart.size,
              opacity: heart.opacity
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      <div className="register-card">
        {!isSubmitted ? (
          <>
            <div className="register-header">
              <h1>Join HerCycle 🌸</h1>
              <p>Create your account and start your health journey</p>
              
              {/* Progress Bar */}
              <div className="progress-bar">
                <div className="progress-line"></div>
                <div 
                  className="progress-fill" 
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className={`progress-step ${currentStep >= step.number ? 'active' : ''}`}
                    title={step.title}
                  >
                    {step.number}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="register-form">
              {/* Step 1: Personal Info */}
              <div className={`form-section ${currentStep === 1 ? 'active' : ''}`}>
                <div className="form-group">
                  <label htmlFor="fullName">
                    👤 Full Name <span>*</span>
                  </label>
                  <div className="input-with-icon">
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="age">
                      🎂 Age <span>*</span>
                    </label>
                    <div className="input-with-icon">
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        min="13"
                        max="100"
                        placeholder="Your age"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="birthday">
                      📅 Birthday <span>*</span>
                    </label>
                    <div className="input-with-icon">
                      
                      <input
                        type="date"
                        id="birthday"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    👫 Gender <span>*</span>
                  </label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="gender"
                        checked={formData.gender === 'female'}
                        onChange={() => handleGenderChange('female')}
                        required
                      />
                      <span className="radio-custom"></span>
                      <span>Female</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="gender"
                        checked={formData.gender === 'male'}
                        onChange={() => handleGenderChange('male')}
                      />
                      <span className="radio-custom"></span>
                      <span>Male</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="gender"
                        checked={formData.gender === 'other'}
                        onChange={() => handleGenderChange('other')}
                      />
                      <span className="radio-custom"></span>
                      <span>Other</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Step 2: School Details */}
              <div className={`form-section ${currentStep === 2 ? 'active' : ''}`}>
                <div className="form-group">
                  <label htmlFor="school">
                    🏫 School/College <span>*</span>
                  </label>
                  <div className="input-with-icon">
                    
                    <input
                      type="text"
                      id="school"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      required
                      placeholder="Enter your school or college name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="grade">
                    📊 Grade/Year <span>*</span>
                  </label>
                  <div className="input-with-icon">
                    
                    <select
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select your grade</option>
                      <option value="9">Grade 9</option>
                      <option value="10">Grade 10</option>
                      <option value="11">Grade 11</option>
                      <option value="12">Grade 12</option>
                      <option value="college1">College Year 1</option>
                      <option value="college2">College Year 2</option>
                      <option value="college3">College Year 3</option>
                      <option value="college4">College Year 4</option>
                      <option value="graduate">Graduate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: Health Info */}
              <div className={`form-section ${currentStep === 3 ? 'active' : ''}`}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="height">
                      📏 Height (cm) <span>*</span>
                    </label>
                    <div className="input-with-icon">
                      
                      <input
                        type="number"
                        id="height"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        required
                        min="100"
                        max="250"
                        step="0.1"
                        placeholder="e.g., 165.5"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="weight">
                      ⚖️ Weight (kg) <span>*</span>
                    </label>
                    <div className="input-with-icon">
                      
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        required
                        min="30"
                        max="200"
                        step="0.1"
                        placeholder="e.g., 55.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="healthNotes">
                    💭 Additional Health Notes (Optional)
                  </label>
                  <div className="input-with-icon">
                    
                    <input
                      type="text"
                      id="healthNotes"
                      name="healthNotes"
                      placeholder="Any health conditions or notes"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                {currentStep > 1 && (
                  <button type="button" className="btn-prev" onClick={prevStep}>
                    ← Previous
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button type="button" className="btn-next" onClick={nextStep}>
                    Next →
                  </button>
                ) : (
                  <button type="submit" className="register-btn">
                    🎉 Complete Registration
                  </button>
                )}
              </div>
            </form>
          </>
        ) : (
          <div className="success-message active">
            <div className="success-icon">🎉</div>
            <h2 style={{ 
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem'
            }}>
              Welcome to HerCycle!
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Your account has been created successfully! 
              We're setting up your personalized dashboard...
            </p>
            <div className="register-btn" style={{ 
              background: 'linear-gradient(135deg, #f59e0b, #f97316)'
            }}>
              ✨ Setting Up Your Profile ✨
            </div>
          </div>
        )}

        <div className="register-footer">
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </div>
    </div>
  );
}