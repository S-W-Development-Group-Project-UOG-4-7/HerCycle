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
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins in development if env flag is set
    if (process.env.DEV_ALLOW_ALL_ORIGINS === 'true') {
      return callback(null, true);
    }

    // Allow requests with no origin (mobile apps, CURL, server-to-server)
    if (!origin) return callback(null, true);

    // Allow any localhost or 127.0.0.1 origin (any port) - helpful for frontend dev on different ports
    try {
      const url = new URL(origin);
      const hostname = url.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return callback(null, true);
      }
    } catch (e) {
      // ignore invalid origin parsing and fall through to explicit check below
    }

    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174'
    ];

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      console.warn('Blocked origin:', origin);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
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

// ========== WEB MANAGER MODEL (ensure available at runtime) ==========
if (!mongoose.models.WebManager) {
  const webManagerSchema = new mongoose.Schema({
    W_ID: { type: String, required: true, unique: true },
    NIC: { type: String, required: true, unique: true, ref: 'User' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    full_name: { type: String, default: '' },
    contact_number: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'], default: 'prefer-not-to-say' },
    date_of_birth: { type: Date },
    department: { type: String, default: 'Web Management' },
    location: { type: String, default: '' },
    profile_picture: { type: String, default: '' },
    is_active: { type: Boolean, default: true },
    permissions: {
      posts: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      campaigns: { type: Boolean, default: true },
      reports: { type: Boolean, default: true },
      donations: { type: Boolean, default: true },
      landing_page: { type: Boolean, default: true },
      fundraising: { type: Boolean, default: true }
    },
    join_date: { type: Date, default: Date.now },
    last_login: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  });

  mongoose.model('WebManager', webManagerSchema);
  console.log('ℹ️ WebManager model registered in server.js');
}

// ========== END WEB MANAGER MODEL ==========

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
        roleData = doctor.toObject();
        user_type = 'doctor';
        
        // Get verification status
        const DoctorVerification = getModel('DoctorVerification');
        if (DoctorVerification) {
          const verification = await DoctorVerification.findOne({ doctor_NIC: user.NIC });
          if (verification) {
            roleData.verification_status = verification.status;
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

// ======= NEW: Web Manager login endpoint =======
app.post('/api/auth/login-web-manager', checkDatabaseReady, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const User = getModel('User');
    const WebManager = getModel('WebManager');

    if (!User) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Ensure WebManager record exists and user has appropriate role
    if (!WebManager) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const webManagerRecord = await WebManager.findOne({ NIC: user.NIC }) || await WebManager.findOne({ email: user.email });
    if (!webManagerRecord) {
      return res.status(403).json({ success: false, message: 'Web manager account not configured. Contact admin.' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, NIC: user.NIC, email: user.email, role: 'web_manager' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const responseData = {
      user_id: user._id,
      NIC: user.NIC,
      full_name: user.full_name,
      email: user.email,
      role: 'web_manager',
      user_type: 'web_manager',
      profile: webManagerRecord.toObject()
    };

    return res.json({ success: true, message: 'Login successful', data: responseData, token });
  } catch (error) {
    console.error('❌ Web manager login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});
// ======= END NEW ROUTE =======

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

    // Prefer NIC from token; fallback to email
    let user = null;
    if (req.user && req.user.NIC) {
      user = await User.findOne({ NIC: req.user.NIC });
    }
    if (!user && req.user && req.user.email) {
      user = await User.findOne({ email: req.user.email.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get role-specific data
    let roleData = {};
    let user_type = 'community_member';

    if (user.role === 'doctor' && Doctor) {
      const doctor = await Doctor.findOne({ NIC: user.NIC });
      if (doctor) {
        roleData = doctor.toObject();
        user_type = 'doctor';
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
      const webManagerRec = await WebManager.findOne({ NIC: user.NIC }) || await WebManager.findOne({ email: user.email.toLowerCase() });
      if (webManagerRec) {
        roleData = webManagerRec.toObject();
        user_type = 'web_manager';
      } else {
        // if role is web_manager but record missing, still mark type
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

    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user data', error: error.message });
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

// ========== ADMIN LANDING PAGE ROUTES ==========
// These routes allow web managers to load and update the landing page content.
app.get('/api/landing-page/admin', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    // Only web managers may access the admin endpoints
    if (req.user.role !== 'web_manager' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Web manager access required' });
    }

    const landingPage = await LandingPage.findOne();

    if (!landingPage) {
      return res.json({ success: true, data: null, message: 'No landing page content found' });
    }

    res.json({ success: true, data: landingPage });
  } catch (error) {
    console.error('❌ Admin GET landing page error:', error);
    res.status(500).json({ success: false, message: 'Failed to load landing page', error: error.message });
  }
});

app.put('/api/landing-page/admin', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    // Only web managers may update the landing page
    if (req.user.role !== 'web_manager' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Web manager access required' });
    }

    const payload = req.body || {};

    // Upsert: update existing document or create a new one
    const updated = await LandingPage.findOneAndUpdate({}, { $set: payload }, { new: true, upsert: true, setDefaultsOnInsert: true });

    res.json({ success: true, message: 'Landing page updated', data: updated });
  } catch (error) {
    console.error('❌ Admin PUT landing page error:', error);
    res.status(500).json({ success: false, message: 'Failed to update landing page', error: error.message });
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
  progressBars: [{
    label: String,
    value: Number,
    color: String,
    order: { type: Number, default: 0 }
  }],
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
      progressBars: [
        { label: 'Total Raised', value: 4200000, color: '#ff4081', order: 0 },
        { label: 'Active Campaigns', value: 42, color: '#4caf50', order: 1 }
      ],
      carouselImages: [
        { image: '/images/fund1.jpg', title: 'Campaign 1', description: 'Supporting girls education', order: 0, active: true },
        { image: '/images/fund2.jpg', title: 'Campaign 2', description: 'Hygiene kits distribution', order: 1, active: true }
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
      data: {
        hero: responseData.hero,
        campaigns: responseData.campaigns,
        progressBars: responseData.progressBars,
        carouselImages: responseData.carouselImages,
        cta: responseData.cta,
        footer: responseData.footer
      },
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
// ========== ADMIN FUNDRAISING ROUTES ==========
// Allow web managers (and admins) to load and update fundraising content
app.get('/api/fundraising/admin', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'web_manager' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Web manager access required' });
    }

    const fundraising = await Fundraising.findOne();
    if (!fundraising) {
      return res.json({ success: true, data: null, message: 'No fundraising content found' });
    }

    res.json({ success: true, data: fundraising });
  } catch (error) {
    console.error('❌ Admin GET fundraising error:', error);
    res.status(500).json({ success: false, message: 'Failed to load fundraising data', error: error.message });
  }
});

app.put('/api/fundraising/admin', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'web_manager' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Web manager access required' });
    }

    const payload = req.body || {};
    const updated = await Fundraising.findOneAndUpdate({}, { $set: payload }, { new: true, upsert: true, setDefaultsOnInsert: true });

    res.json({ success: true, message: 'Fundraising updated', data: updated });
  } catch (error) {
    console.error('❌ Admin PUT fundraising error:', error);
    res.status(500).json({ success: false, message: 'Failed to update fundraising', error: error.message });
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
    // Basic validation and coercion
    if (!paymentIntentId && !metadata?.paymentIntentId) {
      return res.status(400).json({ success: false, message: 'paymentIntentId is required' });
    }

    const pid = paymentIntentId || metadata.paymentIntentId;
    const amt = Number(amount || metadata?.amount || 0);
    if (!amt || amt <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const st = status || (metadata && metadata.status) || 'succeeded';

    const existingDonation = await Donation.findOne({ paymentIntentId: pid });
    if (existingDonation) {
      return res.json({ success: true, message: 'Donation already exists', donationId: pid });
    }

    const donation = new Donation({
      paymentIntentId: pid,
      amount: amt,
      currency: (currency || metadata?.currency || 'inr').toLowerCase(),
      status: st,
      campaignId: campaignId || metadata?.campaignId,
      campaignName: campaignName || metadata?.campaignName || (req.body.campaign && req.body.campaign.title),
      donorName: donorName || metadata?.donorName || (req.body.donorInfo && req.body.donorInfo.name) || 'Anonymous',
      donorEmail: donorEmail || metadata?.donorEmail || (req.body.donorInfo && req.body.donorInfo.email) || '',
      donorPhone: donorPhone || metadata?.donorPhone || '',
      paymentMethod: paymentMethod || metadata?.paymentMethod || '',
      metadata: metadata || {},
      receiptUrl: metadata?.receiptUrl || req.body.receiptUrl || '',
      isTest: req.body.isTest === true || false,
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

app.get('/api/payment/donations', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    // Only web managers or admins may access donations list
    if (req.user.role !== 'web_manager' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Web manager access required' });
    }

    const donations = await Donation.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: donations.length,
      data: donations
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

    // Add the actual reset code verification logic here
    // Example:
    // const user = await db.collection('users').findOne({ email });
    // if (!user || user.resetCode !== resetCode) {
    //   return res.status(400).json({ success: false, message: 'Invalid reset code' });
    // }
    
    // Check if reset code is expired (optional)
    // if (user.resetCodeExpires < new Date()) {
    //   return res.status(400).json({ success: false, message: 'Reset code has expired' });
    // }

    // If valid
    return res.status(200).json({
      success: true,
      message: 'Reset code verified successfully'
      // You might also want to return a token or some identifier
    });

  } catch (error) {
    console.error('Verify reset code error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error' 
    });
  }
});

// ========== END FILE (ensure server is listening) ==========
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// ========== WEB MANAGER ROUTES ==========

// GET Web Manager Profile
app.get('/api/web-manager/profile', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    // Check if user is web manager
    if (req.user.role !== 'web_manager') {
      return res.status(403).json({
        success: false,
        message: 'Web manager access required'
      });
    }

    const User = getModel('User');
    const WebManager = getModel('WebManager');

    if (!User || !WebManager) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Find user
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find web manager record
    const webManager = await WebManager.findOne({ 
      $or: [{ NIC: user.NIC }, { email: user.email }] 
    });

    if (!webManager) {
      // Create a default web manager record if not exists
      const newWebManager = new WebManager({
        NIC: user.NIC,
        email: user.email,
        full_name: user.full_name,
        contact_number: user.contact_number || "",
        gender: user.gender || "",
        date_of_birth: user.date_of_birth || "",
        department: "Web Management",
        location: "Colombo, Sri Lanka",
        profile_picture: user.profile_picture || "",
        is_active: true,
        join_date: user.created_at || new Date(),
        last_login: new Date()
      });
      await newWebManager.save();

      // Use the newly created record
      const responseData = {
        ...user.toObject(),
        ...newWebManager.toObject()
      };
      
      return res.json({
        success: true,
        message: 'Web manager profile loaded',
        data: responseData
      });
    }

    // Combine user and web manager data
    const responseData = {
      ...user.toObject(),
      ...webManager.toObject()
    };

    res.json({
      success: true,
      message: 'Web manager profile loaded',
      data: responseData
    });

  } catch (error) {
    console.error('❌ Get web manager profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch web manager profile',
      error: error.message
    });
  }
});

// UPDATE Web Manager Profile
app.put('/api/web-manager/profile/update', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    // Check if user is web manager
    if (req.user.role !== 'web_manager') {
      return res.status(403).json({
        success: false,
        message: 'Web manager access required'
      });
    }

    const User = getModel('User');
    const WebManager = getModel('WebManager');

    if (!User || !WebManager) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Extract fields from request
    const { 
      full_name, 
      contact_number, 
      gender, 
      date_of_birth, 
      avatar_url, 
      location, 
      department 
    } = req.body;

    // Find user
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update User model
    const userUpdates = {};
    if (full_name) userUpdates.full_name = full_name;
    if (contact_number) userUpdates.contact_number = contact_number;
    if (gender) userUpdates.gender = gender;
    if (date_of_birth) userUpdates.date_of_birth = date_of_birth;
    if (avatar_url) userUpdates.profile_picture = avatar_url;
    userUpdates.updated_at = new Date();

    await User.updateOne({ email: req.user.email }, { $set: userUpdates });

    // Update WebManager model
    const webManagerUpdates = {};
    if (full_name) webManagerUpdates.full_name = full_name;
    if (contact_number) webManagerUpdates.contact_number = contact_number;
    if (gender) webManagerUpdates.gender = gender;
    if (date_of_birth) webManagerUpdates.date_of_birth = date_of_birth;
    if (avatar_url) webManagerUpdates.profile_picture = avatar_url;
    if (location) webManagerUpdates.location = location;
    if (department) webManagerUpdates.department = department;
    webManagerUpdates.updated_at = new Date();

    await WebManager.updateOne(
      { $or: [{ NIC: user.NIC }, { email: user.email }] },
      { $set: webManagerUpdates },
      { upsert: true } // Create if doesn't exist
    );

    // Get updated user data
    const updatedUser = await User.findOne({ email: req.user.email });
    const updatedWebManager = await WebManager.findOne({ 
      $or: [{ NIC: user.NIC }, { email: user.email }] 
    });

    const responseData = {
      ...updatedUser.toObject(),
      ...updatedWebManager.toObject()
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: responseData
    });

  } catch (error) {
    console.error('❌ Update web manager profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// CHANGE PASSWORD for Web Manager
app.put('/api/web-manager/change-password', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    // Check if user is web manager
    if (req.user.role !== 'web_manager') {
      return res.status(403).json({
        success: false,
        message: 'Web manager access required'
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const User = getModel('User');

    if (!User) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Find user
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.updateOne(
      { email: req.user.email },
      { 
        $set: { 
          password_hash: newPasswordHash,
          updated_at: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// File upload endpoint for avatar
app.post('/api/upload/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.file;
    
    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname) || '.jpg';
    const newFileName = `avatar-${uniqueSuffix}${fileExt}`;
    const filePath = path.join(uploadsDir, newFileName);
    
    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);
    
    const fileUrl = `/uploads/${newFileName}`;
    
    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      url: fileUrl,
      filename: newFileName
    });

  } catch (error) {
    console.error('❌ Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
});
// ========== END WEB MANAGER ROUTES ==========


app.listen(PORT, HOST, () => {
  console.log(`🚀 HerCycle backend listening on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log('✅ Available Web Manager routes:');
  console.log('   GET  /api/web-manager/profile');
  console.log('   PUT  /api/web-manager/profile/update');
  console.log('   PUT  /api/web-manager/change-password');
  console.log('   POST /api/upload/avatar');
  console.log('✔️ To allow all origins in development set DEV_ALLOW_ALL_ORIGINS=true');
});