import React, { useState} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [isCycleUser, setIsCycleUser] = useState(false);
  const [licenseFile, setLicenseFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1
    user_type: '',
    
    // Step 2 - Common fields
    NIC: '',
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    contact_number: '',
    
    // Step 3 - Doctor specific
    specialty: '',
    qualifications: '',
    clinic_or_hospital: '',
  });

  // Function to check if a year is a leap year
  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  // Function to calculate age from date
  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Function to get month and day from day of year - CORRECTED VERSION
  const getMonthAndDayFromDayOfYear = (year, dayOfYear) => {
    const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Adjust for leap year
    if (isLeapYear(year)) {
      monthDays[1] = 29;
    }
    
    let dayCount = dayOfYear;
    let month = 0;
    
    // Find the month
    for (let i = 0; i < monthDays.length; i++) {
      if (dayCount <= monthDays[i]) {
        month = i;
        break;
      }
      dayCount -= monthDays[i];
    }
    
    // dayCount now holds the day of the month
    const day = dayCount;
    
    console.log(`Year ${year}, Day ${dayOfYear} -> Month ${month + 1}, Day ${day}`);
    return { month, day };
  };

  // Get gender and DOB from NIC - CORRECTED VERSION
  const getInfoFromNIC = (nic) => {
    nic = nic.trim().toUpperCase();
    
    // Remove any spaces or special characters
    nic = nic.replace(/[^0-9A-Z]/g, '');
    
    let detectedGender = '';
    let detectedDOB = null;
    let detectedAge = '';
    let isValid = false;
    let errorMessage = '';
    
    // Check for old format (9 digits + 1 letter)
    if (nic.length === 10 && /^\d{9}[A-Z]$/.test(nic)) {
      // Old format: 123456789V
      const yearDigits = parseInt(nic.substring(0, 2));
      const dayCode = parseInt(nic.substring(2, 5));
      const checkLetter = nic.charAt(9);
      
      // Determine birth year (1900-1999)
      const birthYear = 1900 + yearDigits;
      
      // Determine gender and actual day of year
      let dayOfYear;
      if (dayCode > 500) {
        detectedGender = 'female';
        dayOfYear = dayCode - 500;
      } else {
        detectedGender = 'male';
        dayOfYear = dayCode;
      }
      
      // Check if the check letter confirms gender (V for male, F for female)
      if (checkLetter === 'F' || checkLetter === 'f') {
        detectedGender = 'female';
      } else if (checkLetter === 'V' || checkLetter === 'v') {
        detectedGender = 'male';
      }
      
      // Validate day of year
      const maxDays = isLeapYear(birthYear) ? 366 : 365;
      
      if (dayOfYear >= 1 && dayOfYear <= maxDays) {
        // Get month and day
        const { month, day } = getMonthAndDayFromDayOfYear(birthYear, dayOfYear);
        // Create date - JavaScript months are 0-indexed
        detectedDOB = new Date(birthYear, month, day);
        detectedAge = calculateAge(detectedDOB);
        isValid = true;
      } else {
        errorMessage = `Invalid day of year: ${dayOfYear}. Max is ${maxDays} for ${birthYear}`;
      }
      
    } 
    // Check for new format (12 digits)
    else if (nic.length === 12 && /^\d{12}$/.test(nic)) {
      // New format: 200419201396
      const birthYear = parseInt(nic.substring(0, 4));
      const genderDayCode = parseInt(nic.substring(4, 7));
      
      // Determine gender and actual day of year
      let dayOfYear;
      if (genderDayCode > 500) {
        detectedGender = 'female';
        dayOfYear = genderDayCode - 500;
      } else {
        detectedGender = 'male';
        dayOfYear = genderDayCode;
      }
      
      // Validate day of year
      const maxDays = isLeapYear(birthYear) ? 366 : 365;
      
      if (dayOfYear >= 1 && dayOfYear <= maxDays) {
        // Get month and day
        const { month, day } = getMonthAndDayFromDayOfYear(birthYear, dayOfYear);
        // Create date - JavaScript months are 0-indexed
        detectedDOB = new Date(birthYear, month, day);
        detectedAge = calculateAge(detectedDOB);
        isValid = true;
        
        console.log(`NIC ${nic}: Year=${birthYear}, DayCode=${genderDayCode}, DayOfYear=${dayOfYear}, Month=${month+1}, Day=${day}, Date=${detectedDOB.toDateString()}`);
      } else {
        errorMessage = `Invalid day of year: ${dayOfYear}. Max is ${maxDays} for ${birthYear}`;
      }
    } else if (nic.length > 0) {
      errorMessage = 'Invalid NIC format. Use: 123456789V (old) or 200419201396 (new)';
    }
    
    return { 
      gender: detectedGender, 
      dob: detectedDOB,
      age: detectedAge,
      isValid: isValid,
      error: errorMessage
    };
  };

  // Handle NIC input
  const handleNICChange = (nic) => {
    if (nic.length >= 10) {
      const { gender: detectedGender, dob: detectedDOB, age: detectedAge, isValid, error: nicError } = getInfoFromNIC(nic);
      
      if (isValid) {
        setGender(detectedGender);
        if (detectedDOB) {
          // Format date without timezone issues
          const year = detectedDOB.getFullYear();
          const month = String(detectedDOB.getMonth() + 1).padStart(2, '0');
          const day = String(detectedDOB.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;
          setDateOfBirth(formattedDate);
          console.log(`Formatted DOB: ${formattedDate} (from ${detectedDOB.toDateString()})`);
        }
        setAge(detectedAge);
        
        // Enable cycle user toggle for females
        if (detectedGender === 'female') {
          setIsCycleUser(true);
        } else {
          setIsCycleUser(false);
        }
        
        // Clear any previous error
        setError('');
      } else if (nicError) {
        // Show NIC parsing error
        setError(nicError);
        setGender('');
        setDateOfBirth('');
        setAge('');
      }
    } else {
      // Reset if NIC is too short
      setGender('');
      setDateOfBirth('');
      setAge('');
      if (nic.length > 0 && nic.length < 10) {
        setError('NIC must be at least 10 characters');
      } else {
        setError('');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'NIC') {
      handleNICChange(value);
    }
    
    if (name === 'password') {
      validatePassword(value);
    }
    
    // Clear general error when typing (but keep NIC-specific errors)
    if (name !== 'NIC') {
      setError('');
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('One number');
    }
    
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push('One special character');
    }
    
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const validateStep1 = () => {
    return formData.user_type !== '';
  };

  const validateStep2 = () => {
    return (
      formData.NIC &&
      formData.full_name &&
      formData.email &&
      formData.password &&
      formData.confirm_password &&
      formData.password === formData.confirm_password &&
      passwordErrors.length === 0 &&
      gender && // NIC must be valid (gender detected)
      dateOfBirth // Date must be detected
    );
  };

  const validateStep3 = () => {
    if (formData.user_type === 'doctor') {
      return formData.specialty && formData.qualifications && licenseFile;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      if (formData.user_type === 'doctor') {
        setStep(3);
      } else {
        handleSubmit();
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF, JPEG, or PNG file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      
      setLicenseFile(file);
      setError(''); // Clear any previous errors
    }
  };

  const uploadLicenseDocument = async (file) => {
    if (!file) return null;
    
    const formData = new FormData();
    formData.append('licenseDocument', file);
    
    try {
      setUploadProgress(30);
      const response = await fetch('http://localhost:5000/api/upload/license', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      const data = await response.json();
      setUploadProgress(70);
      
      if (data.success) {
        setUploadProgress(100);
        return data.url; // Return the uploaded file URL
      } else {
        setError(data.message || 'Failed to upload license document');
        return null;
      }
    } catch (err) {
      setError('Failed to upload license document');
      console.error('Upload error:', err);
      return null;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        gender,
        date_of_birth: dateOfBirth,
        is_cycle_user: isCycleUser,
        age: age
      };

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Store auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        // Redirect based on user type
        if (data.data.user_type === 'doctor') {
          navigate('/doctor-pending');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Registration failed');
        if (data.errors) {
          setPasswordErrors(data.errors);
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSubmit = async () => {
    if (!licenseFile) {
      setError('Please upload your license document for verification');
      return;
    }
    
    setLoading(true);
    setIsUploading(true);
    setError('');
    
    try {
      // Step 1: Upload license document
      const licenseDocumentUrl = await uploadLicenseDocument(licenseFile);
      
      if (!licenseDocumentUrl) {
        setLoading(false);
        setIsUploading(false);
        return;
      }
      
      // Step 2: Complete registration with license URL
      const payload = {
        ...formData,
        gender,
        date_of_birth: dateOfBirth,
        is_cycle_user: isCycleUser,
        age: age,
        license_document_url: licenseDocumentUrl
      };

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Store auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        // Redirect to doctor pending page
        navigate('/doctor-pending');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const renderStep1 = () => (
    <div className="step-container">
      <h3>Join HerCycle</h3>
      <p className="step-description">Select your role to get started</p>
      
      <div className="user-type-options">
        <button
          type="button"
          className={`user-type-card ${formData.user_type === 'community_member' ? 'selected' : ''}`}
          onClick={() => setFormData({...formData, user_type: 'community_member'})}
        >
          <div className="user-type-icon">👥</div>
          <h4>Community Member</h4>
          <p>Join our supportive community, share experiences, and access resources</p>
        </button>
        
        <button
          type="button"
          className={`user-type-card ${formData.user_type === 'doctor' ? 'selected' : ''}`}
          onClick={() => setFormData({...formData, user_type: 'doctor'})}
        >
          <div className="user-type-icon">👩‍⚕️</div>
          <h4>Medical Professional</h4>
          <p>Provide expert advice, participate in Q&A, and get verified</p>
        </button>
      </div>
      
      <div className="step-actions">
        <button
          type="button"
          className="next-button"
          onClick={nextStep}
          disabled={!validateStep1()}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-container">
      <h3>Create Your Account</h3>
      
      <div className="form-group">
        <label htmlFor="NIC">NIC Number *</label>
        <input
          type="text"
          id="NIC"
          name="NIC"
          value={formData.NIC}
          onChange={handleChange}
          required
          placeholder="Enter your NIC (10 or 12 digits)"
          disabled={loading}
          maxLength="12"
        />
        <div className="nic-help-text">
          <small>Format: 123456789V (old) or 200419201396 (new)</small>
        </div>
        {gender && (
          <div className="nic-info">
            <span className="nic-info-text">
              <strong>Detected:</strong> 
              <span className={`gender-badge ${gender}`}>
                {gender === 'female' ? '👩 Female' : '👨 Male'}
              </span>
              {dateOfBirth && (
                <>
                  <span className="info-separator">|</span>
                  <span className="dob-text">DOB: {dateOfBirth}</span>
                </>
              )}
              {age && (
                <>
                  <span className="info-separator">|</span>
                  <span className="age-text">Age: {age}</span>
                </>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="full_name">Full Name *</label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
          placeholder="Enter your full name"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter your email"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="contact_number">Contact Number</label>
        <input
          type="tel"
          id="contact_number"
          name="contact_number"
          value={formData.contact_number}
          onChange={handleChange}
          placeholder="Enter your phone number"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password *</label>
        <div className="password-input">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Create a strong password"
            disabled={loading}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? "👁️‍🗨️" : "👁️"}
          </button>
        </div>
        
        {passwordErrors.length > 0 && (
          <div className="password-requirements">
            <strong>Password must contain:</strong>
            <ul>
              {passwordErrors.map((err, index) => (
                <li key={index} className="requirement-item">• {err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="confirm_password">Confirm Password *</label>
        <div className="password-input">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirm_password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
            placeholder="Confirm your password"
            disabled={loading}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={loading}
          >
            {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
          </button>
        </div>
        {formData.password && formData.confirm_password && formData.password !== formData.confirm_password && (
          <span className="error-text">Passwords do not match</span>
        )}
      </div>

      {/* Cycle User Toggle for Females */}
      {gender === 'female' && (
        <div className="cycle-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={isCycleUser}
              onChange={(e) => setIsCycleUser(e.target.checked)}
              disabled={loading}
            />
            <span className="toggle-slider"></span>
          </label>
          <span>Enable Cycle Tracking Features</span>
          <p className="toggle-description">
            Get access to period tracking, health insights, and personalized reminders
          </p>
        </div>
      )}

      <div className="step-actions">
        <button
          type="button"
          className="back-button"
          onClick={prevStep}
          disabled={loading}
        >
          Back
        </button>
        <button
          type="button"
          className="next-button"
          onClick={nextStep}
          disabled={!validateStep2() || loading}
        >
          {formData.user_type === 'doctor' ? 'Continue' : 'Create Account'}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-container">
      <h3>Doctor Information</h3>
      <p className="step-description">Please provide your professional details</p>
      
      <div className="form-group">
        <label htmlFor="specialty">Specialty *</label>
        <select
          id="specialty"
          name="specialty"
          value={formData.specialty}
          onChange={handleChange}
          required
          disabled={loading || isUploading}
        >
          <option value="">Select your specialty</option>
          <option value="gynecology">Gynecology</option>
          <option value="obstetrics">Obstetrics</option>
          <option value="endocrinology">Endocrinology</option>
          <option value="general_practice">General Practice</option>
          <option value="pediatrics">Pediatrics</option>
          <option value="psychiatry">Psychiatry</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="qualifications">Qualifications *</label>
        <textarea
          id="qualifications"
          name="qualifications"
          value={formData.qualifications}
          onChange={handleChange}
          required
          placeholder="List your medical qualifications (comma separated)"
          disabled={loading || isUploading}
          rows="3"
        />
      </div>

      <div className="form-group">
        <label htmlFor="clinic_or_hospital">Clinic/Hospital</label>
        <input
          type="text"
          id="clinic_or_hospital"
          name="clinic_or_hospital"
          value={formData.clinic_or_hospital}
          onChange={handleChange}
          placeholder="Where do you practice?"
          disabled={loading || isUploading}
        />
      </div>

      {/* License Document Upload */}
      <div className="form-group">
        <label htmlFor="license_document">License Document *</label>
        <div className="file-upload-container">
          <input
            type="file"
            id="license_document"
            name="license_document"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            required
            disabled={loading || isUploading}
            className="file-input"
          />
          <label htmlFor="license_document" className="file-upload-label">
            <div className="upload-icon">📄</div>
            <div className="upload-text">
              <strong>Upload License</strong>
              <small>PDF, JPG, PNG (Max 5MB)</small>
            </div>
            <div className="browse-button">Browse</div>
          </label>
          
          {licenseFile && (
            <div className="file-preview">
              <div className="file-info">
                <span className="file-name">{licenseFile.name}</span>
                <span className="file-size">
                  ({(licenseFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                className="remove-file"
                onClick={() => setLicenseFile(null)}
                disabled={loading || isUploading}
              >
                ✕
              </button>
            </div>
          )}
          
          {isUploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="progress-text">{uploadProgress}% Uploading...</span>
            </div>
          )}
        </div>
        <small className="help-text">
          Upload your medical license, certification, or registration document for verification
        </small>
      </div>

      <div className="verification-notice">
        <div className="notice-icon">📋</div>
        <div className="notice-content">
          <strong>Verification Required</strong>
          <p>Your account will be pending verification. We'll review your documents within 1-2 business days.</p>
        </div>
      </div>

      <div className="step-actions">
        <button
          type="button"
          className="back-button"
          onClick={prevStep}
          disabled={loading || isUploading}
        >
          Back
        </button>
        <button
          type="button"
          className="next-button"
          onClick={handleDoctorSubmit}
          disabled={!validateStep3() || loading || isUploading}
        >
          {loading || isUploading ? (
            <>
              <span className="spinner"></span>
              {isUploading ? 'Uploading...' : 'Creating Account...'}
            </>
          ) : (
            'Submit for Verification'
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="auth-container">
      
      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
        className="back-home-btn"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '10px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(219, 39, 119, 0.3)',
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(219, 39, 119, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(219, 39, 119, 0.3)';
        }}
      >
        <span>←</span>
        Back to Home
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <h2>Join HerCycle</h2>
          <p>Create your account in {step === 1 ? '1' : step === 2 ? '2' : '3'} steps</p>
          
          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`step-line ${formData.user_type === 'doctor' && step >= 3 ? 'active' : ''}`}></div>
            <div className={`step-dot ${formData.user_type === 'doctor' && step >= 3 ? 'active' : ''}`}>3</div>
          </div>
        </div>

        {error && (
          <div className="auth-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <div className="auth-links">
          <span>
            Already have an account? <Link to="/login">Sign In</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;