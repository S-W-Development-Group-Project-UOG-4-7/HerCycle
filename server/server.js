// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')('sk_test_51Sohz3HEwvbtqHzUuV4TF924emk7sIbNJ9lcsADvwaWUqi6wiicdmbcExTHUKUY3S1b8qRUgCMI4HJ1FDQ8B4FVI0077r9FXTz');
const { setupDatabase } = require('./setup.js');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // Added for file uploads

const app = express();
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// ========== MULTER CONFIGURATION FOR FILE UPLOADS ==========
// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF, JPEG, JPG, PNG files
    const allowedTypes = /pdf|jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, JPEG, JPG, and PNG files are allowed'));
    }
  }
});
// ========== END MULTER CONFIGURATION ==========

// ========== CORS CONFIGURATION ==========
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];

const isLocalhostOrigin = (origin) => {
  if (!origin) return true;
  return /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
};

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || isLocalhostOrigin(origin)) {
      return callback(null, true);
    }

    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));

app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));
// ========== END CORS CONFIGURATION ==========

// ========== HELPER FUNCTION TO GET MODELS ==========
const getModel = (modelName) => {
  try {
    return mongoose.model(modelName);
  } catch (error) {
    console.error(`Model ${modelName} not found:`, error.message);
    return null;
  }
};
// ========== END HELPER FUNCTION ==========

// ========== BASIC ROUTES ==========
app.get('/', (req, res) => {
  res.json({
    message: '🚀 HerCycle Backend API',
    status: 'Running',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/auth/me',
      'GET  /api/landing-page',
      'POST /api/seed',
      'GET  /health',
      'GET  /api/fundraising',
      'POST /api/fundraising/seed',
      'POST /api/payment/create-payment-intent',
      'POST /api/payment/save-donation',
      'GET  /api/payment/donations',
      'POST /api/setup-database',
      'POST /api/upload/license',
      'GET  /api/admin/pending-doctors',
      'POST /api/admin/approve-doctor/:nic',
      'POST /api/admin/reject-doctor/:nic',
      'GET  /api/admin/all-doctor-verifications',
      'GET  /api/admin/dashboard-stats'
    ],
    mongo: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.post('/api/setup-database', async (req, res) => {
  try {
    console.log('🔧 Manual database setup triggered...');
    await setupDatabase();
    res.json({
      success: true,
      message: 'Database setup completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
// ========== END BASIC ROUTES ==========

// ========== FILE UPLOAD ROUTE (with multer) ==========
app.post('/api/upload/license', upload.single('licenseDocument'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a license document.'
      });
    }

    const file = req.file;
    
    console.log('📄 File upload received:', {
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fieldname: file.fieldname
    });

    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname) || '.pdf';
    const newFileName = `license-${uniqueSuffix}${fileExt}`;
    const filePath = path.join(uploadsDir, newFileName);
    
    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);
    console.log('✅ File saved to:', filePath);
    
    const fileUrl = `/uploads/${newFileName}`;
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: newFileName,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    });

  } catch (error) {
    console.error('❌ File upload error:', error);
    
    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 5MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${error.message}`
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

// Alternative route for base64 uploads (backward compatibility)
app.post('/api/upload/license-base64', async (req, res) => {
  try {
    const { fileName, fileData } = req.body;
    
    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'File name is required'
      });
    }
    
    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = fileName.split('.').pop();
    const newFileName = `license-${uniqueSuffix}.${fileExt}`;
    
    // If fileData is provided (base64), save it
    if (fileData) {
      // Remove data:image/...;base64, prefix if present
      const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      fs.writeFileSync(path.join(uploadsDir, newFileName), buffer);
      console.log('📄 File saved:', newFileName);
    } else {
      // For now, just create an empty file or return a dummy URL
      console.log('📄 Dummy file created for:', fileName);
    }
    
    const fileUrl = `/uploads/${newFileName}`;
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: newFileName
    });

  } catch (error) {
    console.error('❌ File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});
// ========== END FILE UPLOAD ROUTE ==========

// ========== DATABASE CONNECTION ==========
let isDatabaseReady = false;

mongoose.connect('mongodb://localhost:27017/hercycle', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  console.log('🔧 Running database setup...');
  await setupDatabase();
  console.log('✅ Database setup completed');
  
  isDatabaseReady = true;
  console.log('🚀 Server is ready to handle requests');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});
// ========== END DATABASE CONNECTION ==========

// ========== AUTHENTICATION MIDDLEWARE ==========
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if database is ready
const checkDatabaseReady = (req, res, next) => {
  if (!isDatabaseReady) {
    return res.status(503).json({
      success: false,
      message: 'Database is initializing. Please try again in a moment.'
    });
  }
  next();
};
// ========== END AUTHENTICATION MIDDLEWARE ==========

// ========== AUTHENTICATION ROUTES ==========
// REGULAR USER REGISTRATION ENDPOINT
app.post('/api/auth/register', checkDatabaseReady, async (req, res) => {
  try {
    console.log('📝 Registration attempt');

    const {
      NIC,
      full_name,
      email,
      password,
      contact_number,
      user_type,
      gender,
      date_of_birth,
      is_cycle_user,
      specialty,
      qualifications,
      clinic_or_hospital,
      license_document_url
    } = req.body;

    // Validation
    if (!NIC || !full_name || !email || !password || !user_type) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    // Get User model
    const User = getModel('User');
    const CommunityMember = getModel('CommunityMember');
    const Doctor = getModel('Doctor');
    const DoctorVerification = getModel('DoctorVerification');
    const CycleProfile = getModel('CycleProfile');
    
    if (!User) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { NIC }] 
    });

    if (existingUser) {
      if (user_type === 'doctor') {
        // If user exists as a doctor but has no DoctorVerification, allow re-submission
        if (existingUser.role === 'doctor') {
          const DoctorVerification = getModel('DoctorVerification');
          const Doctor = getModel('Doctor');
          const existingVerification = DoctorVerification ? await DoctorVerification.findOne({ doctor_NIC: existingUser.NIC }) : null;

          if (!existingVerification) {
            console.log('🔄 Existing doctor without verification — creating missing records for:', existingUser.NIC);

            // Ensure Doctor record exists
            if (Doctor) {
              let doctor = await Doctor.findOne({ NIC: existingUser.NIC });
                if (!doctor) {
                  doctor = new Doctor({
                    user: existingUser._id,
                    NIC: existingUser.NIC,
                    specialty: specialty || 'General',
                    qualifications: qualifications ? qualifications.split(',').map(q => q.trim()) : [],
                    clinic_or_hospital: clinic_or_hospital || '',
                    is_approved: false,
                    activated_at: null,
                    experience_years: 0,
                    verified: false
                  });
                  await doctor.save();
                } else {
                  // Update doctor info
                  if (specialty) doctor.specialty = specialty;
                  if (qualifications) doctor.qualifications = qualifications.split(',').map(q => q.trim());
                  if (clinic_or_hospital) doctor.clinic_or_hospital = clinic_or_hospital;
                  if (!doctor.user) doctor.user = existingUser._id;
                  await doctor.save();
                }
              }

            // Create verification record
            if (DoctorVerification && license_document_url) {
              const verification = new DoctorVerification({
                verification_id: `VER_${Date.now()}_${existingUser.NIC}`,
                doctor_NIC: existingUser.NIC,
                license_document_url: license_document_url,
                registration_details: `Re-submitted on ${new Date().toISOString()}. Qualifications: ${qualifications || 'Not provided'}`,
                terms_accepted: true,
                status: 'pending',
                submitted_at: new Date()
              });
              await verification.save();
              console.log('✅ DoctorVerification created for existing doctor:', existingUser.NIC);
            }

            // Update user info if needed
            existingUser.isExisting = 'pending';
            existingUser.updated_at = new Date();
            if (password) {
              const salt = await bcrypt.genSalt(10);
              existingUser.password_hash = await bcrypt.hash(password, salt);
            }
            if (full_name) existingUser.full_name = full_name;
            if (contact_number) existingUser.contact_number = contact_number;
            await existingUser.save();

            // Generate token and respond
            const token = jwt.sign(
              { userId: existingUser._id, NIC: existingUser.NIC, email: existingUser.email, role: existingUser.role },
              JWT_SECRET,
              { expiresIn: '7d' }
            );

            return res.status(200).json({
              success: true,
              message: 'Doctor verification re-submitted successfully',
              data: {
                user_id: existingUser._id,
                NIC: existingUser.NIC,
                full_name: existingUser.full_name,
                email: existingUser.email,
                role: existingUser.role,
                user_type: 'doctor',
                verification_status: 'pending',
                specialty: specialty,
                token: token
              },
              token: token
            });
          }
        }

        // Allow existing standard users to upgrade to doctor and submit verification
        if (existingUser.role === 'user') {
          const Doctor = getModel('Doctor');
          const DoctorVerification = getModel('DoctorVerification');

          if (!Doctor || !DoctorVerification) {
            return res.status(500).json({
              success: false,
              message: 'Server configuration error'
            });
          }

          if (!license_document_url) {
            return res.status(400).json({
              success: false,
              message: 'License document URL is required for doctor registration'
            });
          }

          // Update user role and info
          existingUser.role = 'doctor';
          existingUser.isExisting = 'pending';
          existingUser.updated_at = new Date();
          if (full_name) existingUser.full_name = full_name;
          if (contact_number) existingUser.contact_number = contact_number;
          if (gender) existingUser.gender = gender;
          if (date_of_birth) existingUser.date_of_birth = new Date(date_of_birth);
          if (password) {
            const salt = await bcrypt.genSalt(10);
            existingUser.password_hash = await bcrypt.hash(password, salt);
          }
          await existingUser.save();

          // Create or update doctor profile
          let doctor = await Doctor.findOne({ NIC: existingUser.NIC });
            if (!doctor) {
              doctor = new Doctor({
                user: existingUser._id,
                NIC: existingUser.NIC,
                specialty: specialty || 'general_practice',
                qualifications: qualifications ? qualifications.split(',').map(q => q.trim()) : [],
                clinic_or_hospital: clinic_or_hospital || '',
                is_approved: false,
                activated_at: null,
                experience_years: 0,
                verified: false
              });
            } else {
              if (specialty) doctor.specialty = specialty;
              if (qualifications) doctor.qualifications = qualifications.split(',').map(q => q.trim());
              if (clinic_or_hospital) doctor.clinic_or_hospital = clinic_or_hospital;
              doctor.is_approved = false;
              doctor.verified = false;
              doctor.activated_at = null;
              if (!doctor.user) doctor.user = existingUser._id;
            }
            await doctor.save();

          // Create or refresh verification record
          const existingVerification = await DoctorVerification.findOne({ doctor_NIC: existingUser.NIC });
          if (!existingVerification) {
            const verification = new DoctorVerification({
              verification_id: `VER_${Date.now()}_${existingUser.NIC}`,
              doctor_NIC: existingUser.NIC,
              license_document_url: license_document_url,
              registration_details: `Upgraded on ${new Date().toISOString()}. Qualifications: ${qualifications || 'Not provided'}`,
              terms_accepted: true,
              status: 'pending',
              submitted_at: new Date()
            });
            await verification.save();
          } else {
            existingVerification.license_document_url = license_document_url;
            existingVerification.registration_details = `Re-submitted on ${new Date().toISOString()}. Qualifications: ${qualifications || 'Not provided'}`;
            existingVerification.status = 'pending';
            existingVerification.submitted_at = new Date();
            existingVerification.reviewed_at = null;
            existingVerification.reviewed_by = null;
            existingVerification.rejection_reason = null;
            await existingVerification.save();
          }

          const token = jwt.sign(
            { userId: existingUser._id, NIC: existingUser.NIC, email: existingUser.email, role: existingUser.role },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          return res.status(200).json({
            success: true,
            message: 'Doctor verification submitted successfully',
            data: {
              user_id: existingUser._id,
              NIC: existingUser.NIC,
              full_name: existingUser.full_name,
              email: existingUser.email,
              role: existingUser.role,
              user_type: 'doctor',
              verification_status: 'pending',
              specialty: specialty,
              token: token
            },
            token: token
          });
        }
      }

      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or NIC'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Determine role
    let role = 'user';
    let isExistingStatus = 'active';
    
    if (user_type === 'doctor') {
      role = 'doctor';
      isExistingStatus = 'pending'; // Doctors need verification
    }

    // Create base user
    const userData = {
      NIC,
      full_name,
      email: email.toLowerCase(),
      password_hash,
      gender: gender || 'prefer-not-to-say',
      contact_number: contact_number || '',
      role: role,
      isExisting: isExistingStatus,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    if (date_of_birth) {
      userData.date_of_birth = new Date(date_of_birth);
    }

    const user = new User(userData);
    await user.save();

    // Create role-specific records
    if (user_type === 'doctor') {
      // Doctor registration
        if (Doctor) {
          const doctorData = {
            user: user._id,
            NIC,
            specialty: specialty || 'general_practice',
            qualifications: qualifications ? qualifications.split(',').map(q => q.trim()) : [],
            clinic_or_hospital: clinic_or_hospital || '',
            is_approved: false,
            activated_at: null,
            experience_years: 0,
            verified: false
          };
          const doctor = new Doctor(doctorData);
          await doctor.save();
        }

      if (DoctorVerification) {
        if (!license_document_url) {
          // Rollback user creation
          await User.deleteOne({ NIC: NIC });
          return res.status(400).json({
            success: false,
            message: 'License document URL is required for doctor registration'
          });
        }

        const verification = new DoctorVerification({
          verification_id: `VER_${Date.now()}_${NIC}`,
          doctor_NIC: NIC,
          license_document_url: license_document_url,
          registration_details: `Registered on ${new Date().toISOString()}. Qualifications: ${qualifications || 'Not provided'}`,
          terms_accepted: true,
          status: 'pending',
          submitted_at: new Date()
        });
        await verification.save();
        console.log('✅ DoctorVerification created for NIC:', NIC);
      }
    } else {
      // Community member registration
      if (CommunityMember) {
        const communityMember = new CommunityMember({
          NIC,
          joined_at: new Date(),
          is_active: true
        });
        await communityMember.save();
      }
    }

    // Create cycle profile if enabled
    if (is_cycle_user && gender === 'female' && CycleProfile) {
      const cycleProfile = new CycleProfile({
        NIC,
        activated_at: new Date(),
        is_active: true,
        is_anonymized: false,
        cycle_length: 28,
        period_length: 5,
        tracking_preferences: {
          symptoms: true,
          mood: true,
          flow: true,
          pain: true,
          notes: true
        }
      });
      await cycleProfile.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        NIC, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const responseData = {
      user_id: user._id,
      NIC: user.NIC,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      user_type: user_type,
      is_cycle_user: is_cycle_user || false,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      contact_number: user.contact_number,
      token: token
    };

    if (user_type === 'doctor') {
      responseData.verification_status = 'pending';
      responseData.specialty = specialty;
      responseData.qualifications = qualifications ? qualifications.split(',').map(q => q.trim()) : [];
    }

    console.log('✅ User registered successfully:', user.email);
    
    res.status(201).json({
      success: true,
      message: user_type === 'doctor' ? 'Registration submitted for verification' : 'Registration successful',
      data: responseData,
      token: token
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// LOGIN ENDPOINT - FIXED VERSION
app.post('/api/auth/login', checkDatabaseReady, async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Get models
    const User = getModel('User');
    const Doctor = getModel('Doctor');
    const CommunityMember = getModel('CommunityMember');
    const CycleProfile = getModel('CycleProfile');
    const Admin = getModel('Admin');
    const WebManager = getModel('WebManager');

    if (!User) {
      console.log('❌ User model not found');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Find user
    console.log('🔍 Searching for user with email:', email.toLowerCase());
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    console.log('✅ User found:', user.email);
    console.log('📝 User role:', user.role);
    console.log('🔑 Stored password hash exists:', user.password_hash ? 'YES' : 'NO');

    // Check password
    console.log('🔐 Starting password comparison...');
    console.log('📝 Input password length:', password.length);
    
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('✅ Password comparison result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password does not match');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is suspended or deleted
    if (user.isExisting === 'suspended' || user.isExisting === 'deleted') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended or deleted. Please contact support.'
      });
    }

    // Get role-specific data
    let roleData = {};
    let user_type = 'community_member';
    
    if (user.role === 'doctor' && Doctor) {
        const doctor = await Doctor.findOne({ NIC: user.NIC });
        if (doctor) {
          if (!doctor.user) {
            doctor.user = user._id;
            await doctor.save();
          }
          roleData = doctor.toObject();
          user_type = 'doctor';

        // Get verification status, auto-create if missing
        const DoctorVerification = getModel('DoctorVerification');
        if (DoctorVerification) {
          let verification = await DoctorVerification.findOne({ doctor_NIC: user.NIC });
          if (!verification) {
            // Auto-create missing verification record for existing doctors
            console.log('⚠️ Auto-creating missing DoctorVerification for:', user.NIC);
            verification = new DoctorVerification({
              verification_id: `VER_${Date.now()}_${user.NIC}`,
              doctor_NIC: user.NIC,
              license_document_url: '/uploads/pending-upload',
              registration_details: `Auto-created for existing doctor. Specialty: ${doctor.specialty || 'N/A'}. Qualifications: ${(doctor.qualifications || []).join(', ') || 'N/A'}`,
              terms_accepted: true,
              status: 'pending',
              submitted_at: user.created_at || new Date()
            });
            await verification.save();
          }
          roleData.verification_status = verification.status;
        }
      } else {
        // Doctor record missing — auto-create
        console.log('⚠️ Auto-creating missing Doctor record for:', user.NIC);
          const newDoctor = new Doctor({
            user: user._id,
            NIC: user.NIC,
            specialty: 'General',
            qualifications: [],
            is_approved: false,
            verified: false,
            activated_at: null,
            experience_years: 0
          });
        await newDoctor.save();
        roleData = newDoctor.toObject();
        user_type = 'doctor';

        const DoctorVerification = getModel('DoctorVerification');
        if (DoctorVerification) {
          const verification = new DoctorVerification({
            verification_id: `VER_${Date.now()}_${user.NIC}`,
            doctor_NIC: user.NIC,
            license_document_url: '/uploads/pending-upload',
            registration_details: `Auto-created for existing doctor user.`,
            terms_accepted: true,
            status: 'pending',
            submitted_at: user.created_at || new Date()
          });
          await verification.save();
          roleData.verification_status = 'pending';
        }
      }
    } else if (user.role === 'admin' && Admin) {
      const admin = await Admin.findOne({ NIC: user.NIC });
      if (admin) {
        roleData = admin.toObject();
        user_type = 'admin';
      }
    } else if (user.role === 'web_manager' && WebManager) {
      const webManager = await WebManager.findOne({ NIC: user.NIC });
      if (webManager) {
        roleData = webManager.toObject();
        user_type = 'web_manager';
      }
    } else if (CommunityMember) {
      const communityMember = await CommunityMember.findOne({ NIC: user.NIC });
      if (communityMember) {
        roleData = communityMember.toObject();
      }
    }

    // Check if cycle profile exists
    let is_cycle_user = false;
    if (CycleProfile) {
      const cycleProfile = await CycleProfile.findOne({ NIC: user.NIC });
      is_cycle_user = !!cycleProfile;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        NIC: user.NIC, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const responseData = {
      user_id: user._id,
      NIC: user.NIC,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      user_type: user_type,
      is_cycle_user: is_cycle_user,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      contact_number: user.contact_number,
      profile_picture: user.profile_picture,
      isExisting: user.isExisting,
      ...roleData
    };

    console.log('🎉 Login successful for:', user.email);
    console.log('📊 User type:', user_type);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: responseData,
      token: token
    });

  } catch (error) {
    console.error('❌ Login error details:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// GET CURRENT USER ENDPOINT
app.get('/api/auth/me', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    const User = getModel('User');
    const Doctor = getModel('Doctor');
    const CommunityMember = getModel('CommunityMember');
    const CycleProfile = getModel('CycleProfile');
    const Admin = getModel('Admin');
    const WebManager = getModel('WebManager');

    if (!User) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const user = await User.findOne({ NIC: req.user.NIC });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get role-specific data
    let roleData = {};
    let user_type = 'community_member';
    
    if (user.role === 'doctor' && Doctor) {
      const doctor = await Doctor.findOne({ NIC: user.NIC });
      if (doctor) {
        roleData = doctor.toObject();
        user_type = 'doctor';
        
        // Get verification status
        const DoctorVerification = getModel('DoctorVerification');
        if (DoctorVerification) {
          const verification = await DoctorVerification.findOne({ doctor_NIC: user.NIC });
          if (verification) {
            roleData.verification_status = verification.status;
            roleData.verification_details = verification;
          }
        }
      }
    } else if (user.role === 'admin' && Admin) {
      const admin = await Admin.findOne({ NIC: user.NIC });
      if (admin) {
        roleData = admin.toObject();
        user_type = 'admin';
      }
    } else if (user.role === 'web_manager' && WebManager) {
      const webManager = await WebManager.findOne({ NIC: user.NIC });
      if (webManager) {
        roleData = webManager.toObject();
        user_type = 'web_manager';
      }
    } else if (CommunityMember) {
      const communityMember = await CommunityMember.findOne({ NIC: user.NIC });
      if (communityMember) {
        roleData = communityMember.toObject();
      }
    }

    // Check if cycle profile exists
    let is_cycle_user = false;
    if (CycleProfile) {
      const cycleProfile = await CycleProfile.findOne({ NIC: user.NIC });
      is_cycle_user = !!cycleProfile;
    }

    const responseData = {
      user_id: user._id,
      NIC: user.NIC,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      user_type: user_type,
      is_cycle_user: is_cycle_user,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      contact_number: user.contact_number,
      profile_picture: user.profile_picture,
      created_at: user.created_at,
      isExisting: user.isExisting,
      ...roleData
    };

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data',
      error: error.message
    });
  }
});
// ========== END AUTHENTICATION ROUTES ==========

// ========== ADMIN ROUTES ==========

// GET ALL PENDING DOCTOR VERIFICATIONS
app.get('/api/admin/pending-doctors', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const DoctorVerification = getModel('DoctorVerification');
    const Doctor = getModel('Doctor');
    const User = getModel('User');

    if (!DoctorVerification || !Doctor || !User) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Get all pending verifications with doctor and user info
    const verifications = await DoctorVerification.aggregate([
      { $match: { status: 'pending' } },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctor_NIC',
          foreignField: 'NIC',
          as: 'doctor_info'
        }
      },
      { $unwind: { path: '$doctor_info', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor_NIC',
          foreignField: 'NIC',
          as: 'user_info'
        }
      },
      { $unwind: { path: '$user_info', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          verification_id: 1,
          doctor_NIC: 1,
          license_document_url: 1,
          registration_details: 1,
          submitted_at: 1,
          status: 1,
          doctor_info: {
            specialty: 1,
            qualifications: 1,
            clinic_or_hospital: 1
          },
          user_info: {
            full_name: 1,
            email: 1,
            contact_number: 1,
            gender: 1,
            date_of_birth: 1
          }
        }
      },
      { $sort: { submitted_at: -1 } }
    ]);

    res.json({
      success: true,
      count: verifications.length,
      data: verifications
    });

  } catch (error) {
    console.error('❌ Get pending doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending doctors',
      error: error.message
    });
  }
});

// APPROVE DOCTOR VERIFICATION
app.post('/api/admin/approve-doctor/:nic', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { nic } = req.params;
    const { notes } = req.body;

    const DoctorVerification = getModel('DoctorVerification');
    const Doctor = getModel('Doctor');
    const User = getModel('User');

    if (!DoctorVerification || !Doctor || !User) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Update verification status
    const verification = await DoctorVerification.findOneAndUpdate(
      { doctor_NIC: nic, status: 'pending' },
      {
        $set: {
          status: 'approved',
          reviewed_at: new Date(),
          reviewed_by: req.user.email,
          notes: notes || 'Approved by admin'
        }
      },
      { new: true }
    );

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Pending verification not found'
      });
    }

    // Update doctor record
    await Doctor.findOneAndUpdate(
      { NIC: nic },
      {
        $set: {
          is_approved: true,
          verified: true,
          activated_at: new Date()
        }
      }
    );

    // Update user status
    await User.findOneAndUpdate(
      { NIC: nic },
      {
        $set: {
          isExisting: 'active',
          updated_at: new Date()
        }
      }
    );

    // Get doctor info for response
    const doctor = await Doctor.findOne({ NIC: nic });
    const user = await User.findOne({ NIC: nic });

    console.log(`✅ Doctor approved: ${nic} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Doctor approved successfully',
      data: {
        verification,
        doctor,
        user: {
          full_name: user.full_name,
          email: user.email,
          isExisting: user.isExisting
        }
      }
    });

  } catch (error) {
    console.error('❌ Approve doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve doctor',
      error: error.message
    });
  }
});

// REJECT DOCTOR VERIFICATION
app.post('/api/admin/reject-doctor/:nic', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { nic } = req.params;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const DoctorVerification = getModel('DoctorVerification');
    const Doctor = getModel('Doctor');
    const User = getModel('User');

    if (!DoctorVerification || !Doctor || !User) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Update verification status
    const verification = await DoctorVerification.findOneAndUpdate(
      { doctor_NIC: nic, status: 'pending' },
      {
        $set: {
          status: 'rejected',
          reviewed_at: new Date(),
          reviewed_by: req.user.email,
          rejection_reason: reason,
          notes: notes || ''
        }
      },
      { new: true }
    );

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Pending verification not found'
      });
    }

    // Update user status (optional: keep as pending or mark as rejected)
    await User.findOneAndUpdate(
      { NIC: nic },
      {
        $set: {
          isExisting: 'pending',
          updated_at: new Date()
        }
      }
    );

    console.log(`❌ Doctor rejected: ${nic} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Doctor rejected successfully',
      data: verification
    });

  } catch (error) {
    console.error('❌ Reject doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject doctor',
      error: error.message
    });
  }
});

// GET ALL DOCTOR VERIFICATIONS (with filters)
app.get('/api/admin/all-doctor-verifications', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { status, page = 1, limit = 20 } = req.query;
    
    const DoctorVerification = getModel('DoctorVerification');
    const Doctor = getModel('Doctor');
    const User = getModel('User');

    if (!DoctorVerification || !Doctor || !User) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get verifications with pagination
    const verifications = await DoctorVerification.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctor_NIC',
          foreignField: 'NIC',
          as: 'doctor_info'
        }
      },
      { $unwind: { path: '$doctor_info', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor_NIC',
          foreignField: 'NIC',
          as: 'user_info'
        }
      },
      { $unwind: { path: '$user_info', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          verification_id: 1,
          doctor_NIC: 1,
          license_document_url: 1,
          registration_details: 1,
          submitted_at: 1,
          reviewed_at: 1,
          reviewed_by: 1,
          status: 1,
          rejection_reason: 1,
          notes: 1,
          doctor_info: {
            specialty: 1,
            qualifications: 1,
            clinic_or_hospital: 1
          },
          user_info: {
            full_name: 1,
            email: 1,
            contact_number: 1,
            gender: 1
          }
        }
      },
      { $sort: { submitted_at: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    // Get total count
    const total = await DoctorVerification.countDocuments(filter);

    res.json({
      success: true,
      data: verifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Get all verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verifications',
      error: error.message
    });
  }
});

// GET ADMIN DASHBOARD STATS
app.get('/api/admin/dashboard-stats', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const DoctorVerification = getModel('DoctorVerification');
    const User = getModel('User');
    const Doctor = getModel('Doctor');
    const CommunityMember = getModel('CommunityMember');

    if (!DoctorVerification || !User) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Get counts in parallel for better performance
    const [
      pendingCount,
      totalUsers,
      totalDoctors,
      totalCommunityMembers,
      approvedDoctors,
      rejectedDoctors
    ] = await Promise.all([
      DoctorVerification.countDocuments({ status: 'pending' }),
      User.countDocuments({}),
      Doctor.countDocuments({}),
      CommunityMember ? CommunityMember.countDocuments({}) : Promise.resolve(0),
      DoctorVerification.countDocuments({ status: 'approved' }),
      DoctorVerification.countDocuments({ status: 'rejected' })
    ]);

    res.json({
      success: true,
      data: {
        pending_doctors: pendingCount,
        total_users: totalUsers,
        total_doctors: totalDoctors,
        total_community_members: totalCommunityMembers,
        approved_doctors: approvedDoctors,
        rejected_doctors: rejectedDoctors
      }
    });

  } catch (error) {
    console.error('❌ Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
});
// ========== END ADMIN ROUTES ==========

// ========== CYCLE TRACKING ROUTES ==========
// GET CYCLE PROFILE
app.get('/api/cycle/profile/:nic', checkDatabaseReady, async (req, res) => {
  try {
    const CycleProfile = getModel('CycleProfile');
    
    if (!CycleProfile) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const cycleProfile = await CycleProfile.findOne({ NIC: req.params.nic });
    
    if (!cycleProfile) {
      return res.status(404).json({
        success: false,
        message: 'Cycle profile not found'
      });
    }

    res.json({
      success: true,
      data: cycleProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// SAVE DAILY LOG
app.post('/api/cycle/daily-log', checkDatabaseReady, async (req, res) => {
  try {
    const DailyLog = getModel('DailyLog');
    const CycleProfile = getModel('CycleProfile');
    
    if (!DailyLog || !CycleProfile) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const dailyLog = new DailyLog(req.body);
    await dailyLog.save();
    
    // Update cycle profile predictions
    const cycleProfile = await CycleProfile.findOne({ NIC: req.body.NIC });
    if (cycleProfile && req.body.flow) {
      if (req.body.flow === 'medium' || req.body.flow === 'heavy') {
        cycleProfile.last_period_start = new Date(req.body.date);
        const nextPeriod = new Date(req.body.date);
        nextPeriod.setDate(nextPeriod.getDate() + (cycleProfile.cycle_length || 28));
        cycleProfile.next_period_predicted = nextPeriod;
        await cycleProfile.save();
      }
    }

    res.json({
      success: true,
      message: 'Daily log saved successfully',
      data: dailyLog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET CYCLE HISTORY
app.get('/api/cycle/history/:nic', checkDatabaseReady, async (req, res) => {
  try {
    const DailyLog = getModel('DailyLog');
    const CycleTracker = getModel('CycleTracker');
    
    if (!DailyLog || !CycleTracker) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const logs = await DailyLog.find({ NIC: req.params.nic }).sort({ date: -1 });
    const trackers = await CycleTracker.find({ NIC: req.params.nic }).sort({ period_start_date: -1 });
    
    res.json({
      success: true,
      data: {
        daily_logs: logs,
        cycle_trackers: trackers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
// ========== END CYCLE TRACKING ROUTES ==========

// ========== DOCTOR ROUTES ==========
// GET DOCTOR VERIFICATION STATUS
app.get('/api/doctor/verification/:nic', checkDatabaseReady, async (req, res) => {
  try {
    const DoctorVerification = getModel('DoctorVerification');
    
    if (!DoctorVerification) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const verification = await DoctorVerification.findOne({ doctor_NIC: req.params.nic });
    
    if (!verification) {
      return res.json({
        success: true,
        data: null,
        message: 'No verification record found'
      });
    }

    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET DOCTOR PROFILE
app.get('/api/doctor/profile/:nic', checkDatabaseReady, async (req, res) => {
  try {
    const Doctor = getModel('Doctor');
    const User = getModel('User');
    
    if (!Doctor || !User) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const doctor = await Doctor.findOne({ NIC: req.params.nic });
    const user = await User.findOne({ NIC: req.params.nic });
    
    if (!doctor || !user) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const responseData = {
      ...user.toObject(),
      ...doctor.toObject()
    };

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
// ========== END DOCTOR ROUTES ==========

// ========== LANDING PAGE SCHEMAS ==========
const featureSchema = new mongoose.Schema({
  icon: String,
  title: String,
  description: String
});

const statSchema = new mongoose.Schema({
  number: String,
  label: String
});

const landingPageSchema = new mongoose.Schema({
  hero: {
    badgeText: String,
    mainHeading: String,
    subheading: String
  },
  about: {
    title: String,
    description1: String,
    description2: String
  },
  mission: {
    title: String,
    description: String
  },
  contact: {
    title: String,
    description: String
  },
  footer: {
    tagline: String,
    supportEmail: String,
    socialLinks: [{
      name: String,
      icon: String,
      color: String,
      url: String
    }]
  },
  features: [featureSchema],
  stats: [statSchema]
});

const LandingPage = mongoose.model('LandingPage', landingPageSchema);

// LANDING PAGE ROUTES
app.get('/api/landing-page', async (req, res) => {
  try {
    const landingPage = await LandingPage.findOne();

    const defaultData = {
      hero: {
        badgeText: "Empowering Women Worldwide",
        mainHeading: "Your Circle of Strength & Support",
        subheading: "Join a compassionate community where menstrual health is understood, tracked, and supported."
      },
      about: {
        title: "More Than Just Period Tracking",
        description1: "HerCycle is a safe, inclusive digital community.",
        description2: "Our platform combines intuitive cycle tracking."
      },
      mission: {
        title: "Breaking Barriers, Building Bridges",
        description: "To create an inclusive, educated, and supportive ecosystem."
      },
      contact: {
        title: "Ready to Join Us?",
        description: "Start your journey with HerCycle today."
      },
      footer: {
        tagline: "Empowering women worldwide through education, community, and support.",
        supportEmail: "support@hercycle.com",
        socialLinks: [
          { name: 'Instagram', icon: 'IG', color: 'pink-purple', url: '#' },
          { name: 'Twitter', icon: 'X', color: 'blue-4', url: '#' },
          { name: 'Facebook', icon: 'FB', color: 'blue-6', url: '#' }
        ]
      },
      features: [
        { icon: '🌸', title: 'Cycle Tracking', description: 'Intuitive period tracking with predictive analytics and health insights.' },
        { icon: '💜', title: 'Community Support', description: 'Connect with others in a safe, moderated space for sharing experiences.' },
        { icon: '📚', title: 'Educational Resources', description: 'Access to verified articles, guides, and expert advice on menstrual health.' },
        { icon: '🤝', title: 'Fundraising', description: 'Support menstrual health initiatives and donate to important causes.' },
        { icon: '🔔', title: 'Smart Reminders', description: 'Personalized notifications for your cycle, medications, and appointments.' },
        { icon: '📊', title: 'Health Analytics', description: 'Detailed reports and trends to better understand your menstrual health.' }
      ],
      stats: [
        { number: '50K+', label: 'Active Users' },
        { number: '100+', label: 'Health Articles' },
        { number: '25+', label: 'Partner NGOs' },
        { number: 'Rs.2M+', label: 'Funds Raised' }
      ]
    };

    const responseData = landingPage || defaultData;

    res.json({
      success: true,
      data: responseData,
      fromDatabase: !!landingPage
    });

  } catch (error) {
    res.json({
      success: true,
      data: {
        hero: {
          badgeText: "A safe space for menstrual health",
          mainHeading: "Your Circle of Strength & Support",
          subheading: "Join thousands of women in a supportive community focused on menstrual health, education, and empowerment."
        },
        about: {
          title: "More Than Just an App",
          description1: "HerCycle is a revolutionary platform that combines community support with evidence-based education about menstrual health.",
          description2: "We're breaking taboos and creating a safe space for open conversations about periods, fertility, and women's health."
        },
        mission: {
          title: "Empowering Women Worldwide",
          description: "We're on a mission to make menstrual health education accessible to every woman, regardless of background or location."
        },
        contact: {
          title: "Ready to Join?",
          description: "Be part of a growing community that's changing how we talk about menstrual health."
        },
        footer: {
          tagline: "Creating a world where menstrual health is openly discussed and properly supported.",
          supportEmail: "support@hercycle.com",
          socialLinks: [
            { name: 'Instagram', icon: 'IG', color: 'pink-purple', url: '#' },
            { name: 'Twitter', icon: 'X', color: 'blue-4', url: '#' },
            { name: 'Facebook', icon: 'FB', color: 'blue-6', url: '#' }
          ]
        },
        features: [
          { icon: '🌸', title: 'Cycle Tracking', description: 'Intuitive period tracking with predictive analytics and health insights.' },
          { icon: '💜', title: 'Community Support', description: 'Connect with others in a safe, moderated space for sharing experiences.' },
          { icon: '📚', title: 'Educational Resources', description: 'Access to verified articles, guides, and expert advice on menstrual health.' },
          { icon: '🤝', title: 'Fundraising', description: 'Support menstrual health initiatives and donate to important causes.' },
          { icon: '🔔', title: 'Smart Reminders', description: 'Personalized notifications for your cycle, medications, and appointments.' },
          { icon: '📊', title: 'Health Analytics', description: 'Detailed reports and trends to better understand your menstrual health.' }
        ],
        stats: [
          { number: '50K+', label: 'Active Users' },
          { number: '100+', label: 'Health Articles' },
          { number: '25+', label: 'Partner NGOs' },
          { number: 'Rs.2M+', label: 'Funds Raised' }
        ]
      },
      message: 'Using fallback data (database error)'
    });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    await LandingPage.deleteMany({});
    
    const landingPage = new LandingPage({
      hero: {
        badgeText: "Empowering Women Worldwide",
        mainHeading: "Your Circle of Strength & Support",
        subheading: "Join a compassionate community where menstrual health is understood, tracked, and supported."
      },
      about: {
        title: "More Than Just Period Tracking",
        description1: "HerCycle is a safe, inclusive digital community dedicated to breaking taboos around menstrual health.",
        description2: "Our platform combines intuitive cycle tracking with educational resources and community support."
      },
      mission: {
        title: "Breaking Barriers, Building Bridges",
        description: "To create an inclusive, educated, and supportive ecosystem where every woman feels empowered and informed about her menstrual health."
      },
      contact: {
        title: "Ready to Join Us?",
        description: "Start your journey with HerCycle today and be part of a movement that's changing how we talk about menstrual health."
      },
      footer: {
        tagline: "Empowering women worldwide through education, community, and support.",
        supportEmail: "support@hercycle.com",
        socialLinks: [
          { name: 'Instagram', icon: 'IG', color: 'pink-purple', url: '#' },
          { name: 'Twitter', icon: 'X', color: 'blue-4', url: '#' },
          { name: 'Facebook', icon: 'FB', color: 'blue-6', url: '#' }
        ]
      },
      features: [
        { icon: '🌸', title: 'Cycle Tracking', description: 'Intuitive period tracking with predictive analytics and health insights.' },
        { icon: '💜', title: 'Community Support', description: 'Connect with others in a safe, moderated space for sharing experiences.' },
        { icon: '📚', title: 'Educational Resources', description: 'Access to verified articles, guides, and expert advice on menstrual health.' },
        { icon: '🤝', title: 'Fundraising', description: 'Support menstrual health initiatives and donate to important causes.' },
        { icon: '🔔', title: 'Smart Reminders', description: 'Personalized notifications for your cycle, medications, and appointments.' },
        { icon: '📊', title: 'Health Analytics', description: 'Detailed reports and trends to better understand your menstrual health.' }
      ],
      stats: [
        { number: '50K+', label: 'Active Users' },
        { number: '100+', label: 'Health Articles' },
        { number: '25+', label: 'Partner NGOs' },
        { number: 'Rs.2M+', label: 'Funds Raised' }
      ]
    });
    
    await landingPage.save();
    
    res.json({ 
      success: true,
      message: 'Database seeded successfully!'
    });
    
  } catch (error) {
    res.json({ 
      success: false,
      error: error.message 
    });
  }
});
// ========== END LANDING PAGE ROUTES ==========

// ========== FUNDRAISING SCHEMAS ==========
const carouselImageSchema = new mongoose.Schema({
  image: String,
  title: String,
  description: String,
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const heroStatSchema = new mongoose.Schema({
  number: String,
  label: String,
  order: { type: Number, default: 0 }
});

const campaignSchema = new mongoose.Schema({
  title: String,
  description: String,
  raised: Number,
  goal: Number,
  donors: Number,
  daysLeft: Number,
  image: String,
  category: String,
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const fundraisingSchema = new mongoose.Schema({
  hero: {
    badgeText: String,
    mainHeading: String,
    subheading: String,
    stats: [heroStatSchema]
  },
  campaigns: [campaignSchema],
  carouselImages: [carouselImageSchema],
  cta: {
    title: String,
    description: String
  },
  footer: {
    description: String,
    volunteerText: String,
    partnerText: String,
    copyright: String
  }
}, {
  timestamps: true
});

const Fundraising = mongoose.model('Fundraising', fundraisingSchema);

// FUNDRAISING ROUTES
app.get('/api/fundraising', async (req, res) => {
  try {
    const fundraising = await Fundraising.findOne();
    
    const defaultData = {
      hero: {
        badgeText: "Making a Real Difference",
        mainHeading: "Fuel the Change in Menstrual Health",
        subheading: "Every contribution brings us closer to a world where no girl misses school, no woman lacks access to menstrual products, and menstrual health is a right, not a privilege.",
        stats: [
          { number: 'Rs.4.2M+', label: 'Total Raised', order: 0 },
          { number: '8.5K+', label: 'Donors', order: 1 },
          { number: '42', label: 'Campaigns', order: 2 },
          { number: '65K+', label: 'Lives Impacted', order: 3 }
        ]
      },
      campaigns: [
        {
          title: "Sanitary Pads for Rural Schools",
          description: "Providing sustainable menstrual hygiene products to 5000+ girls in remote areas of India.",
          raised: 1250000,
          goal: 2500000,
          donors: 1245,
          daysLeft: 45,
          image: "🌸",
          category: "Education",
          active: true,
          order: 0
        }
      ],
      cta: {
        title: "Ready to Make a Difference?",
        description: "Your donation today can change a life tomorrow. Join thousands of donors who are creating lasting change in menstrual health."
      },
      footer: {
        description: "A HerCycle initiative dedicated to funding menstrual health projects and creating lasting impact.",
        volunteerText: "Volunteer",
        partnerText: "Partner With Us",
        copyright: "© 2026 HerFund by HerCycle. All donations are tax-deductible. 100% transparency guaranteed."
      }
    };

    const responseData = fundraising || defaultData;

    res.json({
      success: true,
      data: responseData,
      fromDatabase: !!fundraising
    });

  } catch (error) {
    res.json({
      success: true,
      data: defaultData,
      message: 'Using fallback fundraising data (database error)'
    });
  }
});

app.post('/api/fundraising/seed', async (req, res) => {
  try {
    await Fundraising.deleteMany({});
    
    const fundraising = new Fundraising({
      hero: {
        badgeText: "Making a Real Difference",
        mainHeading: "Fuel the Change in Menstrual Health",
        subheading: "Every contribution brings us closer to a world where no girl misses school, no woman lacks access to menstrual products, and menstrual health is a right, not a privilege.",
        stats: [
          { number: 'Rs.4.2M+', label: 'Total Raised', order: 0 },
          { number: '8.5K+', label: 'Donors', order: 1 },
          { number: '42', label: 'Campaigns', order: 2 },
          { number: '65K+', label: 'Lives Impacted', order: 3 }
        ]
      },
      campaigns: [
        {
          title: "Sanitary Pads for Rural Schools",
          description: "Providing sustainable menstrual hygiene products to 5000+ girls in remote areas of India.",
          raised: 1250000,
          goal: 2500000,
          donors: 1245,
          daysLeft: 45,
          image: "🌸",
          category: "Education",
          active: true,
          order: 0
        }
      ],
      cta: {
        title: "Ready to Make a Difference?",
        description: "Your donation today can change a life tomorrow. Join thousands of donors who are creating lasting change in menstrual health."
      },
      footer: {
        description: "A HerCycle initiative dedicated to funding menstrual health projects and creating lasting impact.",
        volunteerText: "Volunteer",
        partnerText: "Partner With Us",
        copyright: "© 2026 HerFund by HerCycle. All donations are tax-deductible. 100% transparency guaranteed."
      }
    });
    
    await fundraising.save();
    
    res.json({ 
      success: true,
      message: 'Fundraising database seeded successfully!'
    });
    
  } catch (error) {
    res.json({ 
      success: false,
      error: error.message 
    });
  }
});
// ========== END FUNDRAISING ROUTES ==========

// ========== DONATION SCHEMA ==========
const donationSchema = new mongoose.Schema({
  paymentIntentId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'inr' },
  status: { type: String, required: true },
  campaignId: String,
  campaignName: String,
  donorName: String,
  donorEmail: String,
  donorPhone: String,
  paymentMethod: String,
  metadata: mongoose.Schema.Types.Mixed,
  receiptUrl: String,
  isTest: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Donation = mongoose.model('Donation', donationSchema);

// PAYMENT ROUTES
app.post('/api/payment/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'inr', campaignId, campaignName } = req.body;

    console.log('Creating payment intent for amount:', amount);

    // Validate amount - minimum Rs.50 (5000 paise) for Stripe
    if (!amount || amount < 50) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least Rs.50'
      });
    }

    // Convert amount to paise (Stripe expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: currency.toLowerCase(),
      metadata: {
        campaign_id: campaignId || 'unknown',
        campaign_name: campaignName || 'HerFund Donation',
        timestamp: new Date().toISOString(),
      },
      description: `Donation for ${campaignName || 'HerFund Campaign'}`,
      automatic_payment_methods: {
        enabled: true,
      }
    });

    console.log('PaymentIntent created:', paymentIntent.id);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      type: error.type,
      code: error.code,
    });
  }
});

app.post('/api/payment/save-donation', async (req, res) => {
  try {
    const {
      paymentIntentId,
      amount,
      currency,
      status,
      campaignId,
      campaignName,
      donorName,
      donorEmail,
      donorPhone,
      paymentMethod,
      metadata,
    } = req.body;

    const existingDonation = await Donation.findOne({ paymentIntentId });
    if (existingDonation) {
      return res.json({
        success: true,
        message: 'Donation already exists',
        donationId: paymentIntentId
      });
    }

    const donation = new Donation({
      paymentIntentId,
      amount,
      currency,
      status,
      campaignId,
      campaignName,
      donorName,
      donorEmail,
      donorPhone,
      paymentMethod,
      metadata,
      isTest: true,
      createdAt: new Date()
    });

    await donation.save();

    if (campaignId) {
      try {
        const fundraising = await Fundraising.findOne();
        if (fundraising && fundraising.campaigns) {
          const campaignIndex = fundraising.campaigns.findIndex(
            camp => camp._id.toString() === campaignId
          );
          if (campaignIndex !== -1) {
            fundraising.campaigns[campaignIndex].raised += amount;
            fundraising.campaigns[campaignIndex].donors += 1;
            await fundraising.save();
          }
        }
      } catch (campaignError) {
        console.error('Error updating campaign:', campaignError);
      }
    }

    res.json({
      success: true,
      message: 'Donation saved successfully',
      donationId: paymentIntentId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving donation:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get('/api/payment/donations', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
// ========== END PAYMENT ROUTES ==========

// ========== TEST LOGIN ROUTE (For Debugging) ==========
app.post('/api/auth/login-test', checkDatabaseReady, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 TEST Login attempt for:', email);
    
    // Quick test: create test user if doesn't exist
    if (email === 'test@test.com' && password === 'test123') {
      const User = getModel('User');
      let user = await User.findOne({ email: 'test@test.com' });
      
      if (!user) {
        // Create test user
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash('test123', salt);
        
        user = new User({
          NIC: 'TEST123456789',
          full_name: 'Test User',
          email: 'test@test.com',
          password_hash: password_hash,
          gender: 'female',
          role: 'user',
          isExisting: 'active',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        await user.save();
        console.log('✅ Test user created automatically');
      }
      
      const token = jwt.sign(
        { 
          userId: user._id, 
          NIC: user.NIC, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.json({
        success: true,
        message: 'Login successful (test user)',
        data: {
          user_id: user._id,
          NIC: user.NIC,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          user_type: 'user',
          is_cycle_user: false,
          gender: user.gender,
          isExisting: 'active'
        },
        token: token
      });
    }
    
    // Fallback to normal login logic
    const normalLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await normalLoginResponse.json();
    res.json(data);
    
  } catch (error) {
    console.error('❌ Test login error:', error);
    res.status(500).json({
      success: false,
      message: 'Test login failed',
      error: error.message
    });
  }
});

// ========== PASSWORD RESET ROUTES ==========
const crypto = require('crypto');
// Note: You'll need to create emailService.js or remove this import
// const { sendPasswordResetEmail, sendPasswordResetConfirmation } = require('./emailService');

// Password reset schema
const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  resetCode: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for automatic expiration
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

// REQUEST PASSWORD RESET
app.post('/api/auth/forgot-password', checkDatabaseReady, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    console.log(`🔐 Password reset requested for: ${email}`);

    // Get User model
    const User = getModel('User');
    if (!User) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success even if user doesn't exist (for security)
      console.log(`ℹ️ User not found for email: ${email}`);
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a reset code shortly.'
      });
    }

    // Check if user is active
    if (user.isExisting !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active. Please contact support.'
      });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Delete any existing reset codes for this email
    await PasswordReset.deleteMany({ email: email.toLowerCase() });

    // Save reset code to database
    const passwordReset = new PasswordReset({
      email: email.toLowerCase(),
      resetCode,
      expiresAt,
      used: false,
      attempts: 0
    });

    await passwordReset.save();

    // Note: In production, you would send an email here
    // For now, we'll log it and return success
    console.log(`📧 Password reset code for ${email}: ${resetCode} (simulated email)`);

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a reset code shortly.',
      hint: 'Check your email for the 6-digit reset code.',
      debug_code: resetCode // Remove this in production
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
});

// VERIFY RESET CODE
app.post('/api/auth/verify-reset-code', checkDatabaseReady, async (req, res) => {
  try {
    const { email, resetCode } = req.body;

    if (!email || !resetCode) {
      return res.status(400).json({
        success: false,
        message: 'Email and reset code are required'
      });
    }

    console.log(`🔍 Verifying reset code for: ${email}`);

    // Find reset record
    const resetRecord = await PasswordReset.findOne({
      email: email.toLowerCase(),
      resetCode,
      used: false
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    // Check if code has expired
    if (resetRecord.expiresAt < new Date()) {
      await PasswordReset.deleteOne({ _id: resetRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired'
      });
    }

    // Increment attempts
    resetRecord.attempts += 1;
    
    // If too many attempts, mark as used
    if (resetRecord.attempts >= 5) {
      resetRecord.used = true;
      await resetRecord.save();
      return res.status(400).json({
        success: false,
        message: 'Too many attempts. Please request a new reset code.'
      });
    }

    await resetRecord.save();

    // Generate verification token for the next step
    const verificationToken = jwt.sign(
      {
        email: email.toLowerCase(),
        resetCode,
        purpose: 'password_reset'
      },
      JWT_SECRET,
      { expiresIn: '10m' } // Short-lived token
    );

    console.log(`✅ Reset code verified for: ${email}`);

    res.json({
      success: true,
      message: 'Reset code verified successfully',
      verificationToken,
      expiresAt: resetRecord.expiresAt
    });

  } catch (error) {
    console.error('❌ Verify reset code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify reset code',
      error: error.message
    });
  }
});

// RESET PASSWORD
app.post('/api/auth/reset-password', checkDatabaseReady, async (req, res) => {
  try {
    const { verificationToken, newPassword, confirmPassword } = req.body;

    if (!verificationToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Password validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(verificationToken, JWT_SECRET);
    } catch (jwtError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check if token is for password reset
    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token purpose'
      });
    }

    const { email, resetCode } = decoded;

    console.log(`🔑 Resetting password for: ${email}`);

    // Verify reset code one more time
    const resetRecord = await PasswordReset.findOne({
      email: email.toLowerCase(),
      resetCode,
      used: false
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or already used reset code'
      });
    }

    // Get User model
    const User = getModel('User');
    if (!User) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as old password'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password_hash = password_hash;
    user.updated_at = new Date();
    await user.save();

    // Mark reset code as used
    resetRecord.used = true;
    resetRecord.updatedAt = new Date();
    await resetRecord.save();

    console.log(`✅ Password reset successful for: ${email}`);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
});

// RESEND RESET CODE
app.post('/api/auth/resend-reset-code', checkDatabaseReady, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    console.log(`🔄 Resending reset code to: ${email}`);

    // Get User model
    const User = getModel('User');
    if (!User) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a reset code shortly.'
      });
    }

    // Delete any existing reset codes
    await PasswordReset.deleteMany({ email: email.toLowerCase() });

    // Generate new 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save new reset code
    const passwordReset = new PasswordReset({
      email: email.toLowerCase(),
      resetCode,
      expiresAt,
      used: false,
      attempts: 0
    });

    await passwordReset.save();

    // Note: In production, you would send an email here
    console.log(`📧 New reset code for ${email}: ${resetCode} (simulated email)`);

    res.json({
      success: true,
      message: 'A new reset code has been sent to your email.',
      hint: 'Check your email for the 6-digit reset code.',
      debug_code: resetCode // Remove this in production
    });

  } catch (error) {
    console.error('❌ Resend reset code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend reset code',
      error: error.message
    });
  }
});
// ========== END PASSWORD RESET ROUTES ==========

// ========== COMMUNITY ARTICLES ROUTES ==========
// Optional auth middleware - sets req.user if token present, but doesn't block
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) req.user = user;
    });
  }
  next();
};

// ========== DOCTOR DASHBOARD HELPERS ==========
const slugify = (value) => {
  if (!value) return '';
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const getDoctorCategoryModel = () => {
  try {
    return mongoose.model('Category');
  } catch {
    const categorySchema = new mongoose.Schema({
      name: { type: String, required: true, trim: true, unique: true },
      slug: { type: String, lowercase: true, unique: true },
      description: { type: String },
      icon: { type: String },
      color: { type: String, default: '#6366f1' },
      isActive: { type: Boolean, default: true },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }, { collection: 'categories' });

    categorySchema.pre('save', function(next) {
      if (this.isModified('name')) {
        this.slug = slugify(this.name);
      }
      this.updatedAt = new Date();
      next();
    });

    return mongoose.model('Category', categorySchema);
  }
};

const getDoctorArticleModel = () => {
  try {
    return mongoose.model('DoctorArticle');
  } catch {
    const doctorArticleSchema = new mongoose.Schema({
      title: { type: String, required: true, trim: true, maxlength: 200 },
      slug: { type: String, lowercase: true },
      content: { type: String, required: true },
      excerpt: { type: String, maxlength: 300 },
      featuredImage: { type: String, default: '' },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
      categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      tags: [{ type: String, trim: true }],
      status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }],
      publishedAt: { type: Date },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }, { collection: 'articles' });

    doctorArticleSchema.pre('save', function(next) {
      if (this.isModified('title')) {
        this.slug = slugify(this.title);
      }
      if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
      }
      this.updatedAt = new Date();
      next();
    });

    return mongoose.model('DoctorArticle', doctorArticleSchema);
  }
};

const getDoctorNotificationModel = () => {
  try {
    return mongoose.model('DoctorNotification');
  } catch {
    const notificationSchema = new mongoose.Schema({
      doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
      article: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorArticle' },
      actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type: { type: String, enum: ['comment', 'like', 'system'], default: 'system' },
      title: { type: String, default: '' },
      message: { type: String, default: '' },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }, { collection: 'doctor_notifications' });

    return mongoose.model('DoctorNotification', notificationSchema);
  }
};

const ensureDoctor = async (req, res, next) => {
  if (!req.user || req.user.role !== 'doctor') {
    return res.status(403).json({ success: false, message: 'Doctor access required' });
  }

  const Doctor = getModel('Doctor');
  if (!Doctor) {
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

    let doctor = await Doctor.findOne({ NIC: req.user.NIC });
    if (!doctor) {
      doctor = new Doctor({
        user: req.user.userId,
        NIC: req.user.NIC,
        specialty: 'General',
        qualifications: [],
        clinic_or_hospital: '',
        bio: '',
        is_approved: false,
        verified: false,
        activated_at: null,
        experience_years: 0
      });
      await doctor.save();
    } else if (!doctor.user && req.user.userId) {
      doctor.user = req.user.userId;
      await doctor.save();
    }

  req.doctor = doctor;
  next();
};
// ========== END DOCTOR DASHBOARD HELPERS ==========

// ========== DOCTOR DASHBOARD ROUTES ==========
// Categories
app.get('/api/categories', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const Category = getDoctorCategoryModel();
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/categories/:id', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const Category = getDoctorCategoryModel();
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/categories', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const Category = getDoctorCategoryModel();
    const { name, description, icon, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      icon,
      color,
      createdBy: req.doctor._id
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/categories/:id', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const Category = getDoctorCategoryModel();
    const { name, description, icon, color, isActive } = req.body;

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = new Date();

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/categories/:id', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const Category = getDoctorCategoryModel();
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Articles
app.get('/api/articles', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const Article = getDoctorArticleModel();
    const { status, page = 1, limit = 10 } = req.query;

    const query = { author: req.doctor._id };
    if (status) {
      query.status = status;
    }

    const articles = await Article.find(query)
      .populate('categories', 'name slug color')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));

    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      articles,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      currentPage: parseInt(page, 10),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/articles/:id', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const Article = getDoctorArticleModel();
    const article = await Article.findOne({
      _id: req.params.id,
      author: req.doctor._id
    }).populate('categories', 'name slug color');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ success: true, article });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/articles', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const Article = getDoctorArticleModel();
    const { title, content, excerpt, featuredImage, categories, tags, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const tagList = Array.isArray(tags)
      ? tags.map(tag => tag.toString().trim()).filter(Boolean)
      : (tags || '').toString().split(',').map(tag => tag.trim()).filter(Boolean);

    const finalExcerpt = excerpt && excerpt.trim()
      ? excerpt.trim()
      : content.trim().substring(0, 280);

    const article = await Article.create({
      title: title.trim(),
      content: content.trim(),
      excerpt: finalExcerpt,
      featuredImage: featuredImage || '',
      categories: Array.isArray(categories) ? categories : [],
      tags: tagList,
      status: status || 'draft',
      author: req.doctor._id
    });

    const populatedArticle = await Article.findById(article._id).populate('categories', 'name slug color');
    res.status(201).json({ success: true, article: populatedArticle });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/articles/:id', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const Article = getDoctorArticleModel();
    const { title, content, excerpt, featuredImage, categories, tags, status } = req.body;

    const article = await Article.findOne({
      _id: req.params.id,
      author: req.doctor._id
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const updateData = {};
    if (title) {
      updateData.title = title;
      updateData.slug = slugify(title);
    }
    if (content) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (categories) updateData.categories = categories;
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags)
        ? tags.map(tag => tag.toString().trim()).filter(Boolean)
        : tags.toString().split(',').map(tag => tag.trim()).filter(Boolean);
    }
    if (status) {
      updateData.status = status;
      if (status === 'published' && !article.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    updateData.updatedAt = new Date();

    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('categories', 'name slug color');

    res.json({ success: true, article: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/articles/:id', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const Article = getDoctorArticleModel();
    const article = await Article.findOne({
      _id: req.params.id,
      author: req.doctor._id
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    await Article.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/articles/:id/comments', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    const Article = getDoctorArticleModel();
    const Notification = getDoctorNotificationModel();
    const User = getModel('User');
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const comment = {
      user: req.user.userId,
      text: text.trim()
    };

    article.comments.push(comment);
    await article.save();

    if (Notification && User) {
      const actor = await User.findById(req.user.userId).lean();
      const actorName = actor?.full_name || 'Someone';
      if (article.author && article.author.toString() !== req.doctor?._id?.toString()) {
        await Notification.create({
          doctor: article.author,
          article: article._id,
          actor: req.user.userId,
          type: 'comment',
          title: 'New comment',
          message: `${actorName} commented on "${article.title}".`
        });
      }
    }

    res.status(201).json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/articles/:id/likes', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    const Article = getDoctorArticleModel();
    const Notification = getDoctorNotificationModel();
    const User = getModel('User');

    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    article.likes += 1;
    await article.save();

    if (Notification && User) {
      const actor = await User.findById(req.user.userId).lean();
      const actorName = actor?.full_name || 'Someone';
      if (article.author && article.author.toString() !== req.doctor?._id?.toString()) {
        await Notification.create({
          doctor: article.author,
          article: article._id,
          actor: req.user.userId,
          type: 'like',
          title: 'New like',
          message: `${actorName} liked "${article.title}".`
        });
      }
    }

    res.json({ success: true, likes: article.likes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Doctor profile + stats
app.get('/api/doctors/profile', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const User = getModel('User');
    const user = await User.findById(req.user.userId).lean();

    const doctor = req.doctor.toObject();
    const qualifications = Array.isArray(doctor.qualifications)
      ? doctor.qualifications.join(', ')
      : doctor.qualifications || '';

    res.json({
      success: true,
      doctor: {
        ...doctor,
        specialization: doctor.specialty || doctor.specialization || 'General',
        qualifications,
        experience: doctor.experience_years || doctor.experience || 0,
        bio: doctor.bio || '',
        contactNumber: user?.contact_number || '',
        clinicAddress: doctor.clinic_or_hospital || '',
        profileImage: user?.profile_picture || '',
        user: user ? { full_name: user.full_name, email: user.email, name: user.full_name } : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/doctors/profile', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const User = getModel('User');
    const { name, email, specialization, qualifications, experience, bio, contactNumber, clinicAddress, profileImage } = req.body;

    if (name || email || contactNumber || profileImage) {
      const updateUser = {};
      if (name) updateUser.full_name = name;
      if (email) updateUser.email = email;
      if (contactNumber !== undefined) updateUser.contact_number = contactNumber;
      if (profileImage !== undefined) updateUser.profile_picture = profileImage;
      await User.findByIdAndUpdate(req.user.userId, updateUser);
    }

    const doctorUpdate = {};
    if (specialization) doctorUpdate.specialty = specialization;
    if (qualifications !== undefined) {
      doctorUpdate.qualifications = Array.isArray(qualifications)
        ? qualifications
        : qualifications.toString().split(',').map(q => q.trim()).filter(Boolean);
    }
    if (experience !== undefined) doctorUpdate.experience_years = Number(experience) || 0;
    if (bio !== undefined) doctorUpdate.bio = bio;
    if (clinicAddress !== undefined) doctorUpdate.clinic_or_hospital = clinicAddress;

    const Doctor = getModel('Doctor');
    const updatedDoctor = await Doctor.findOneAndUpdate(
      { NIC: req.user.NIC },
      doctorUpdate,
      { new: true, runValidators: true }
    );

    const updatedUser = await User.findById(req.user.userId).lean();
    const qualificationsText = Array.isArray(updatedDoctor.qualifications)
      ? updatedDoctor.qualifications.join(', ')
      : updatedDoctor.qualifications || '';

    res.json({
      success: true,
      doctor: {
        ...updatedDoctor.toObject(),
        specialization: updatedDoctor.specialty || updatedDoctor.specialization || 'General',
        qualifications: qualificationsText,
        experience: updatedDoctor.experience_years || updatedDoctor.experience || 0,
        bio: updatedDoctor.bio || '',
        contactNumber: updatedUser?.contact_number || '',
        clinicAddress: updatedDoctor.clinic_or_hospital || '',
        profileImage: updatedUser?.profile_picture || '',
        user: updatedUser ? { full_name: updatedUser.full_name, email: updatedUser.email, name: updatedUser.full_name } : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/doctors/stats', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const Article = getDoctorArticleModel();
    const totalArticles = await Article.countDocuments({ author: req.doctor._id });
    const publishedArticles = await Article.countDocuments({ author: req.doctor._id, status: 'published' });
    const draftArticles = await Article.countDocuments({ author: req.doctor._id, status: 'draft' });

    const articles = await Article.find({ author: req.doctor._id }).lean();
    const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
    const totalComments = articles.reduce((sum, article) => sum + (article.comments ? article.comments.length : 0), 0);
    const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0);

    res.json({
      success: true,
      stats: {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalViews,
        totalComments,
        totalLikes
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Notifications
app.get('/api/notifications', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const Notification = getDoctorNotificationModel();
    const limit = Math.max(1, parseInt(req.query.limit || '20', 10));
    const notifications = await Notification.find({ doctor: req.doctor._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('actor', 'full_name');

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const Notification = getDoctorNotificationModel();
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, doctor: req.doctor._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/notifications/read-all', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const Notification = getDoctorNotificationModel();
    await Notification.updateMany(
      { doctor: req.doctor._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/notifications/clear', authenticateToken, checkDatabaseReady, ensureDoctor, async (req, res) => {
  try {
    const Notification = getDoctorNotificationModel();
    await Notification.deleteMany({ doctor: req.doctor._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// ========== END DOCTOR DASHBOARD ROUTES ==========

// ========== COMMUNITY POSTS ROUTES ==========
const resolvePostByParam = async (Post, idParam) => {
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    const byId = await Post.findById(idParam);
    if (byId) return byId;
  }
  return Post.findOne({ post_id: idParam });
};

const buildPostResponse = async (post, userMap, likedSet) => {
  const isAnonymous = !!post.is_anonymous;
  const authorNic = post.author_nic;
  const authorUser = !isAnonymous && authorNic ? userMap.get(authorNic) : null;
  const authorName = isAnonymous
    ? 'Anonymous'
    : (authorUser?.full_name || 'Community Member');

  return {
    _id: post._id,
    post_id: post.post_id,
    title: post.title,
    content: post.content,
    excerpt: post.content ? post.content.substring(0, 200) + '...' : '',
    media_url: post.media_url || '',
    media_type: post.media_type || 'none',
    category: post.category || 'general',
    tags: Array.isArray(post.tags) ? post.tags : [],
    approval_status: post.approval_status,
    allow_comments: post.allow_comments !== false,
    is_anonymous: isAnonymous,
    author: {
      nic: isAnonymous ? null : authorNic,
      name: authorName,
      profile_picture: isAnonymous ? '' : (authorUser?.profile_picture || '')
    },
    author_type: post.author_type || 'user',
    view_count: post.view_count || 0,
    like_count: post.like_count || 0,
    comment_count: post.comment_count || 0,
    isLiked: likedSet ? likedSet.has(post._id.toString()) : false,
    created_at: post.created_at,
    updated_at: post.updated_at
  };
};

// GET /api/posts - Community posts feed
app.get('/api/posts', optionalAuth, checkDatabaseReady, async (req, res) => {
  try {
    const Post = getModel('Post');
    const User = getModel('User');
    const Like = getModel('Like');

    if (!Post || !User) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const { page = 1, limit = 10, search, category, sort = 'newest' } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const query = { approval_status: 'approved' };
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    let sortObj = { created_at: -1 };
    if (sort === 'popular') sortObj = { like_count: -1, comment_count: -1, view_count: -1 };
    if (sort === 'most_commented') sortObj = { comment_count: -1, created_at: -1 };

    const [posts, total] = await Promise.all([
      Post.find(query).sort(sortObj).skip(skip).limit(parseInt(limit, 10)).lean(),
      Post.countDocuments(query)
    ]);

    const authorNics = Array.from(new Set(posts.map(post => post.author_nic).filter(Boolean)));
    const users = authorNics.length
      ? await User.find({ NIC: { $in: authorNics } }).lean()
      : [];
    const userMap = new Map(users.map(user => [user.NIC, user]));

    let likedSet = null;
    if (req.user && Like && posts.length) {
      const postIds = posts.map(post => post._id.toString());
      const likes = await Like.find({
        nic: req.user.NIC,
        like_type: 'post',
        post_id: { $in: postIds }
      }).lean();
      likedSet = new Set(likes.map(like => like.post_id));
    }

    const enriched = [];
    for (const post of posts) {
      enriched.push(await buildPostResponse(post, userMap, likedSet));
    }

    res.json({
      success: true,
      data: enriched,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch posts', error: error.message });
  }
});

// GET /api/posts/:id - Single post detail
app.get('/api/posts/:id', optionalAuth, checkDatabaseReady, async (req, res) => {
  try {
    const Post = getModel('Post');
    const User = getModel('User');
    const Like = getModel('Like');

    if (!Post || !User) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const post = await resolvePostByParam(Post, req.params.id);
    if (!post || post.approval_status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    await Post.updateOne({ _id: post._id }, { $inc: { view_count: 1 } });
    const authorUser = post.is_anonymous ? null : await User.findOne({ NIC: post.author_nic }).lean();
    const userMap = new Map(authorUser ? [[post.author_nic, authorUser]] : []);
    const likedSet = req.user && Like
      ? new Set((await Like.find({
        nic: req.user.NIC,
        like_type: 'post',
        post_id: post._id.toString()
      }).lean()).map(like => like.post_id))
      : null;

    const payload = await buildPostResponse({ ...post.toObject(), view_count: (post.view_count || 0) + 1 }, userMap, likedSet);
    res.json({ success: true, data: payload });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch post', error: error.message });
  }
});

// POST /api/posts - Create post
app.post('/api/posts', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    const Post = getModel('Post');
    const CommunityMember = getModel('CommunityMember');
    const User = getModel('User');

    if (!Post || !User) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const {
      title,
      content,
      category = 'general',
      tags = [],
      media_url = '',
      media_type = 'none',
      is_anonymous = false,
      allow_comments = true
    } = req.body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const normalizedTags = Array.isArray(tags)
      ? tags.map(tag => tag.toString().trim()).filter(Boolean)
      : tags.toString().split(',').map(tag => tag.trim()).filter(Boolean);

    const rawRole = (req.user.role || '').toLowerCase();
    const authorType = rawRole === 'doctor'
      ? 'doctor'
      : rawRole === 'web_manager'
      ? 'web_manager'
      : rawRole === 'admin'
      ? 'web_manager'
      : 'user';

    const post = new Post({
      post_id: `POST_${Date.now()}_${req.user.NIC}`,
      author_nic: req.user.NIC,
      author_type: authorType,
      title: title.trim(),
      content: content.trim(),
      media_url: media_url || '',
      media_type: media_type || 'none',
      category,
      tags: normalizedTags,
      approval_status: 'approved',
      approved_at: new Date(),
      is_anonymous: !!is_anonymous,
      allow_comments: allow_comments !== false,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      report_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    });

    await post.save();

    if (CommunityMember) {
      try {
        await CommunityMember.updateOne({ NIC: req.user.NIC }, { $inc: { post_count: 1 } });
      } catch {}
    }

    const authorUser = await User.findOne({ NIC: req.user.NIC }).lean();
    const userMap = new Map(authorUser ? [[req.user.NIC, authorUser]] : []);
    const payload = await buildPostResponse(post.toObject(), userMap, null);

    res.status(201).json({ success: true, data: payload });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: 'Failed to create post', error: error.message });
  }
});

const handlePostLike = async (req, res) => {
  try {
    const Post = getModel('Post');
    const Like = getModel('Like');

    if (!Post || !Like) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const post = await resolvePostByParam(Post, req.params.id);
    if (!post || post.approval_status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const postKey = post._id.toString();
    const existingLike = await Like.findOne({
      post_id: postKey,
      nic: req.user.NIC,
      like_type: 'post'
    });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      await Post.updateOne({ _id: post._id }, { $inc: { like_count: -1 } });
      return res.json({
        success: true,
        liked: false,
        likes: Math.max(0, (post.like_count || 0) - 1)
      });
    }

    const newLike = new Like({
      like_id: `LIKE_POST_${Date.now()}_${req.user.NIC}`,
      post_id: postKey,
      nic: req.user.NIC,
      like_type: 'post'
    });
    await newLike.save();
    await Post.updateOne({ _id: post._id }, { $inc: { like_count: 1 } });
    return res.json({
      success: true,
      liked: true,
      likes: (post.like_count || 0) + 1
    });
  } catch (error) {
    console.error('Error toggling post like:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle like', error: error.message });
  }
};

// PUT or POST /api/posts/:id/like - Toggle like
app.put('/api/posts/:id/like', authenticateToken, checkDatabaseReady, handlePostLike);
app.post('/api/posts/:id/like', authenticateToken, checkDatabaseReady, handlePostLike);

// GET /api/posts/:id/comments - List comments
app.get('/api/posts/:id/comments', checkDatabaseReady, async (req, res) => {
  try {
    const Comment = getModel('Comment');
    const User = getModel('User');
    const Post = getModel('Post');

    if (!Comment || !User || !Post) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const post = await resolvePostByParam(Post, req.params.id);
    if (!post || post.approval_status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comments = await Comment.find({ post_id: post._id.toString() }).sort({ created_at: 1 }).lean();
    const authorNics = Array.from(new Set(comments.map(comment => comment.nic).filter(Boolean)));
    const users = authorNics.length
      ? await User.find({ NIC: { $in: authorNics } }).lean()
      : [];
    const userMap = new Map(users.map(user => [user.NIC, user]));

    const enriched = comments.map(comment => {
      const isAnonymous = !!comment.is_anonymous;
      const authorUser = !isAnonymous && comment.nic ? userMap.get(comment.nic) : null;
      return {
        ...comment,
        authorName: isAnonymous ? 'Anonymous' : (authorUser?.full_name || 'Community Member'),
        authorRole: isAnonymous ? 'user' : (authorUser?.role || 'user'),
        authorProfile: isAnonymous ? '' : (authorUser?.profile_picture || '')
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Error fetching post comments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comments', error: error.message });
  }
});

// POST /api/posts/:id/comments - Add comment or reply
app.post('/api/posts/:id/comments', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    const Comment = getModel('Comment');
    const Post = getModel('Post');
    const User = getModel('User');
    const CommunityMember = getModel('CommunityMember');

    if (!Comment || !Post || !User) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const post = await resolvePostByParam(Post, req.params.id);
    if (!post || post.approval_status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (post.allow_comments === false) {
      return res.status(403).json({ success: false, message: 'Comments are disabled for this post' });
    }

    const { text, parentCommentId, is_anonymous = false } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const comment = new Comment({
      comment_id: `COMMENT_${Date.now()}_${req.user.NIC}`,
      post_id: post._id.toString(),
      nic: req.user.NIC,
      comment_text: text.trim(),
      parent_comment_id: parentCommentId || null,
      is_anonymous: !!is_anonymous,
      like_count: 0,
      report_count: 0,
      is_edited: false,
      created_at: new Date(),
      updated_at: new Date()
    });

    await comment.save();
    await Post.updateOne({ _id: post._id }, { $inc: { comment_count: 1 } });

    if (CommunityMember) {
      try {
        await CommunityMember.updateOne({ NIC: req.user.NIC }, { $inc: { comment_count: 1 } });
      } catch {}
    }

    const authorUser = await User.findOne({ NIC: req.user.NIC }).lean();
    res.status(201).json({
      success: true,
      data: {
        ...comment.toObject(),
        authorName: is_anonymous ? 'Anonymous' : (authorUser?.full_name || 'Community Member'),
        authorRole: is_anonymous ? 'user' : (authorUser?.role || 'user'),
        authorProfile: is_anonymous ? '' : (authorUser?.profile_picture || '')
      }
    });
  } catch (error) {
    console.error('Error creating post comment:', error);
    res.status(500).json({ success: false, message: 'Failed to create comment', error: error.message });
  }
});
// ========== END COMMUNITY POSTS ROUTES ==========

// Register read-only models for Doctor backend collections
const getArticleModel = () => {
  try {
    return mongoose.model('Article');
  } catch {
    const articleSchema = new mongoose.Schema({}, { strict: false, collection: 'articles' });


    return mongoose.model('Article', articleSchema);
  }
};

const getDoctorProfileModel = () => {
  try {
    return mongoose.model('DoctorProfile');
  } catch {
    const doctorProfileSchema = new mongoose.Schema({}, { strict: false, collection: 'doctors' });
    return mongoose.model('DoctorProfile', doctorProfileSchema);
  }
};

// GET /api/community/articles - Paginated feed of published articles
app.get('/api/community/articles', optionalAuth, checkDatabaseReady, async (req, res) => {
  try {
    const Article = getArticleModel();
    const DoctorProfile = getDoctorProfileModel();
    const User = getModel('User');
    const Like = getModel('Like');

    const { page = 1, limit = 10, search, sort = 'newest' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { status: 'published' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    let sortObj = { publishedAt: -1 };
    if (sort === 'popular') sortObj = { likes: -1, views: -1 };
    if (sort === 'most_viewed') sortObj = { views: -1 };

    const [articles, total] = await Promise.all([
      Article.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)).lean(),
      Article.countDocuments(query)
    ]);

    // Enrich with author info
    const enriched = await Promise.all(articles.map(async (article) => {
      let authorName = 'Unknown Doctor';
      let authorSpecialization = '';
      try {
        const doctor = await DoctorProfile.findById(article.author).lean();
        if (doctor && doctor.user) {
          const user = await User.findById(doctor.user).lean();
          if (user) authorName = user.full_name;
          authorSpecialization = doctor.specialization || '';
        }
      } catch {}

      // Check if current user liked this article
      let isLiked = false;
      if (req.user) {
        const like = await Like.findOne({
          article_id: article._id.toString(),
          nic: req.user.NIC,
          like_type: 'article'
        });
        isLiked = !!like;
      }

      // Get comment count from ArticleComment model
      const ArticleComment = getModel('ArticleComment');
      let commentCount = 0;
      if (ArticleComment) {
        commentCount = await ArticleComment.countDocuments({
          article_id: article._id.toString(),
          is_deleted: false
        });
      }

      return {
        _id: article._id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || (article.content ? article.content.substring(0, 200) + '...' : ''),
        featuredImage: article.featuredImage,
        author: { name: authorName, specialization: authorSpecialization },
        tags: article.tags || [],
        status: article.status,
        views: article.views || 0,
        likes: article.likes || 0,
        commentCount,
        isLiked,
        publishedAt: article.publishedAt,
        createdAt: article.createdAt
      };
    }));

    res.json({
      success: true,
      data: enriched,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching community articles:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch articles', error: error.message });
  }
});

// GET /api/community/doctor-suggestions - Basic doctor follow suggestions
app.get('/api/community/doctor-suggestions', checkDatabaseReady, async (req, res) => {
  try {
    const DoctorProfile = getDoctorProfileModel();
    const User = getModel('User');
    if (!DoctorProfile || !User) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const limit = Math.max(1, parseInt(req.query.limit || '6', 10));

    const doctorDocs = await DoctorProfile.find({}).lean();
    const verifiedDocs = doctorDocs.filter(doc => doc.verified || doc.is_approved || doc.isVerified);
    const pool = verifiedDocs.length ? verifiedDocs : doctorDocs;

    const suggestions = [];
    const seen = new Set();

    for (const doc of pool) {
      if (suggestions.length >= limit) break;
      let name = '';
      try {
        if (doc.user) {
          const user = await User.findById(doc.user).lean();
          if (user) name = user.full_name || '';
        } else if (doc.NIC) {
          const user = await User.findOne({ NIC: doc.NIC }).lean();
          if (user) name = user.full_name || '';
        }
      } catch {}

      const specialization = doc.specialization || doc.specialty || 'Doctor';
      if (!name) name = 'Verified Doctor';
      if (seen.has(name)) continue;
      seen.add(name);
      suggestions.push({ name, specialization });
    }

    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Error fetching doctor suggestions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suggestions', error: error.message });
  }
});

// GET /api/community/articles/:id - Single article detail
app.get('/api/community/articles/:id', optionalAuth, checkDatabaseReady, async (req, res) => {
  try {
    const Article = getArticleModel();
    const DoctorProfile = getDoctorProfileModel();
    const User = getModel('User');
    const Like = getModel('Like');

    const article = await Article.findById(req.params.id).lean();
    if (!article || article.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Increment views
    await Article.updateOne({ _id: article._id }, { $inc: { views: 1 } });

    let authorName = 'Unknown Doctor';
    let authorSpecialization = '';
    try {
      const doctor = await DoctorProfile.findById(article.author).lean();
      if (doctor && doctor.user) {
        const user = await User.findById(doctor.user).lean();
        if (user) authorName = user.full_name;
        authorSpecialization = doctor.specialization || '';
      }
    } catch {}

    let isLiked = false;
    if (req.user) {
      const like = await Like.findOne({
        article_id: article._id.toString(),
        nic: req.user.NIC,
        like_type: 'article'
      });
      isLiked = !!like;
    }

    const ArticleComment = getModel('ArticleComment');
    let commentCount = 0;
    if (ArticleComment) {
      commentCount = await ArticleComment.countDocuments({
        article_id: article._id.toString(),
        is_deleted: false
      });
    }

    res.json({
      success: true,
      data: {
        ...article,
        views: (article.views || 0) + 1,
        author: { name: authorName, specialization: authorSpecialization },
        isLiked,
        commentCount
      }
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch article', error: error.message });
  }
});

// POST /api/community/articles/:id/like - Toggle like
app.post('/api/community/articles/:id/like', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    const Article = getArticleModel();
    const Like = getModel('Like');

    const article = await Article.findById(req.params.id);
    if (!article || article.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const existingLike = await Like.findOne({
      article_id: article._id.toString(),
      nic: req.user.NIC,
      like_type: 'article'
    });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      await Article.updateOne({ _id: article._id }, { $inc: { likes: -1 } });
      return res.json({ success: true, liked: false, likes: Math.max(0, (article.likes || 0) - 1) });
    } else {
      const newLike = new Like({
        like_id: `LIKE_ART_${Date.now()}_${req.user.NIC}`,
        article_id: article._id.toString(),
        nic: req.user.NIC,
        like_type: 'article'
      });
      await newLike.save();
      await Article.updateOne({ _id: article._id }, { $inc: { likes: 1 } });
      return res.json({ success: true, liked: true, likes: (article.likes || 0) + 1 });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle like', error: error.message });
  }
});

// GET /api/community/articles/:id/comments - Get all comments
app.get('/api/community/articles/:id/comments', checkDatabaseReady, async (req, res) => {
  try {
    const ArticleComment = getModel('ArticleComment');
    const User = getModel('User');

    if (!ArticleComment) {
      return res.json({ success: true, data: [] });
    }

    const comments = await ArticleComment.find({
      article_id: req.params.id,
      is_deleted: false
    }).sort({ created_at: 1 }).lean();

    // Enrich with author names
    const enriched = await Promise.all(comments.map(async (comment) => {
      let authorName = 'Unknown';
      try {
        const user = await User.findOne({ NIC: comment.author_nic }).lean();
        if (user) authorName = user.full_name;
      } catch {}
      return {
        ...comment,
        authorName
      };
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comments', error: error.message });
  }
});

// POST /api/community/articles/:id/comments - Add comment or reply
app.post('/api/community/articles/:id/comments', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    const ArticleComment = getModel('ArticleComment');
    const User = getModel('User');
    const Article = getArticleModel();

    if (!ArticleComment) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const { text, parentCommentId } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    // Verify article exists
    const article = await Article.findById(req.params.id);
    if (!article || article.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const comment = new ArticleComment({
      article_id: req.params.id,
      author_nic: req.user.NIC,
      author_role: req.user.role || 'user',
      text: text.trim(),
      parent_comment_id: parentCommentId || null
    });

    await comment.save();

    // Get author name for response
    let authorName = 'Unknown';
    try {
      const user = await User.findOne({ NIC: req.user.NIC }).lean();
      if (user) authorName = user.full_name;
    } catch {}

    res.status(201).json({
      success: true,
      data: {
        ...comment.toObject(),
        authorName
      }
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ success: false, message: 'Failed to create comment', error: error.message });
  }
});

// PUT /api/community/articles/:id/comments/:commentId - Edit comment
app.put('/api/community/articles/:id/comments/:commentId', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    const ArticleComment = getModel('ArticleComment');
    if (!ArticleComment) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const comment = await ArticleComment.findOne({
      _id: req.params.commentId,
      article_id: req.params.id,
      is_deleted: false
    });

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const isOwner = comment.author_nic === req.user.NIC;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'web_manager';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this comment' });
    }

    comment.text = text.trim();
    comment.updated_at = new Date();
    await comment.save();

    res.json({ success: true, data: comment });
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(500).json({ success: false, message: 'Failed to edit comment', error: error.message });
  }
});

// DELETE /api/community/articles/:id/comments/:commentId - Delete comment (soft delete)
app.delete('/api/community/articles/:id/comments/:commentId', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    const ArticleComment = getModel('ArticleComment');
    if (!ArticleComment) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const comment = await ArticleComment.findOne({
      _id: req.params.commentId,
      article_id: req.params.id,
      is_deleted: false
    });

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const isOwner = comment.author_nic === req.user.NIC;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'web_manager';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    comment.is_deleted = true;
    comment.updated_at = new Date();
    await comment.save();

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comment', error: error.message });
  }
});
// ========== END COMMUNITY ARTICLES ROUTES ==========

// ========== SERVER STARTUP ==========
const PORT = 5000;
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Express server started on http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('\n📋 Available Endpoints:');
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login-test (for testing)`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/api/landing-page`);
  console.log(`   GET  http://localhost:${PORT}/api/fundraising`);
  console.log(`   POST http://localhost:${PORT}/api/upload/license`);
  console.log(`\n🔐 Admin Endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/admin/pending-doctors`);
  console.log(`   POST http://localhost:${PORT}/api/admin/approve-doctor/:nic`);
  console.log(`   POST http://localhost:${PORT}/api/admin/reject-doctor/:nic`);
  console.log(`   GET  http://localhost:${PORT}/api/admin/all-doctor-verifications`);
  console.log(`   GET  http://localhost:${PORT}/api/admin/dashboard-stats`);
  console.log('\n🔐 Default Admin Credentials:');
  console.log('   Email: admin@hercycle.com');
  console.log('   Password: admin123');
  console.log('\n👤 Test User Credentials:');
  console.log('   Email: test@test.com');
  console.log('   Password: test123');
  console.log('\n⚠️  Note: Database initialization may take a few seconds');
  console.log('='.repeat(60));
});
// ========== END SERVER STARTUP ==========
