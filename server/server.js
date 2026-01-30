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
  'http://localhost:5174'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
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

// ========== PROFILE PICTURE UPLOAD ==========
app.post('/api/upload/profile-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select an image.'
      });
    }

    const file = req.file;

    // Validate file type (images only)
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedImageTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only JPEG, JPG, and PNG images are allowed'
      });
    }

    console.log('📷 Profile picture upload received:', {
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname) || '.jpg';
    const newFileName = `profile-${uniqueSuffix}${fileExt}`;
    const filePath = path.join(uploadsDir, newFileName);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);
    console.log('✅ Profile picture saved to:', filePath);

    const fileUrl = `/uploads/${newFileName}`;

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      url: fileUrl,
      filename: newFileName
    });

  } catch (error) {
    console.error('❌ Profile picture upload error:', error);

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

    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
});
// ========== END PROFILE PICTURE UPLOAD ==========

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

// GET ALL DOCTORS (for activation/deactivation management)
app.get('/api/admin/doctors', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const Doctor = getModel('Doctor');
    const User = getModel('User');
    const { status, page = 1, limit = 50 } = req.query;

    if (!Doctor || !User) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Build filter
    const filter = {};
    if (status === 'approved') {
      filter.is_approved = true;
    } else if (status === 'pending') {
      filter.is_approved = false;
    }
    // 'all' or no status - no filter

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get doctors with user info
    const doctors = await Doctor.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'NIC',
          foreignField: 'NIC',
          as: 'user_info'
        }
      },
      { $unwind: { path: '$user_info', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          NIC: 1,
          specialty: 1,
          qualifications: 1,
          clinic_or_hospital: 1,
          bio: 1,
          is_approved: 1,
          is_active: 1,
          activated_at: 1,
          experience_years: 1,
          verified: 1,
          'user_info.full_name': 1,
          'user_info.email': 1,
          'user_info.contact_number': 1,
          'user_info.gender': 1,
          'user_info.profile_picture': 1
        }
      },
      { $sort: { activated_at: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    const total = await Doctor.countDocuments(filter);

    res.json({
      success: true,
      count: doctors.length,
      total,
      data: doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: error.message
    });
  }
});

// UPDATE DOCTOR STATUS (activate/deactivate)
app.put('/api/admin/doctors/:nic', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { is_active } = req.body;
    const Doctor = getModel('Doctor');

    if (!Doctor) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    if (typeof is_active === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'is_active field is required'
      });
    }

    const doctor = await Doctor.findOneAndUpdate(
      { NIC: req.params.nic },
      { $set: { is_active } },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    console.log(`✅ Doctor status updated: ${req.params.nic} - is_active: ${is_active}`);
    res.json({
      success: true,
      message: 'Doctor status updated successfully',
      data: doctor
    });
  } catch (error) {
    console.error('❌ Update doctor status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor status',
      error: error.message
    });
  }
});
// ========== END ADMIN ROUTES ==========


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
// ========== ADMIN DASHBOARD - WEB MANAGER MANAGEMENT ==========
// CREATE WEB MANAGER
app.post('/api/admin/create-web-manager', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { NIC, full_name, email, password, permissions } = req.body;

    if (!NIC || !full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const User = getModel('User');
    const WebManager = getModel('WebManager');

    const existingUser = await User.findOne({ $or: [{ email }, { NIC }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = new User({
      NIC, full_name, email: email.toLowerCase(), password_hash,
      role: 'web_manager', isExisting: 'active', is_active: true
    });
    await user.save();

    const webManager = new WebManager({
      W_ID: `WM_${Date.now()}_${NIC}`, NIC, is_active: true,
      permissions: permissions || { posts: true, comments: true, campaigns: true, reports: true, donations: true, landing_page: true, fundraising: true }
    });
    await webManager.save();

    console.log(`✅ Web Manager created: ${email}`);
    res.status(201).json({ success: true, message: 'Web Manager created', data: { user, webManager } });
  } catch (error) {
    console.error('❌ Create web manager error:', error);
    res.status(500).json({ success: false, message: 'Failed to create web manager', error: error.message });
  }
});

// GET ALL WEB MANAGERS
app.get('/api/admin/web-managers', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const WebManager = getModel('WebManager');
    const webManagers = await WebManager.aggregate([
      { $lookup: { from: 'users', localField: 'NIC', foreignField: 'NIC', as: 'user_info' } },
      { $unwind: { path: '$user_info', preserveNullAndEmptyArrays: true } },
      { $project: { W_ID: 1, NIC: 1, registered_at: 1, is_active: 1, permissions: 1, 'user_info.full_name': 1, 'user_info.email': 1 } },
      { $sort: { registered_at: -1 } }
    ]);

    res.json({ success: true, count: webManagers.length, data: webManagers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch web managers', error: error.message });
  }
});

// UPDATE WEB MANAGER
app.put('/api/admin/web-managers/:nic', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
    const { permissions, is_active } = req.body;
    const WebManager = getModel('WebManager');
    const updateData = {};
    if (permissions) updateData.permissions = permissions;
    if (typeof is_active !== 'undefined') updateData.is_active = is_active;
    const webManager = await WebManager.findOneAndUpdate({ NIC: req.params.nic }, { $set: updateData }, { new: true });
    if (!webManager) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: webManager });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  }
});

// CHECK WEB MANAGER STATUS
app.get('/api/admin/check-web-manager-status/:nic', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    const WebManager = getModel('WebManager');
    const webManager = await WebManager.findOne({ NIC: req.params.nic });

    if (!webManager) {
      return res.json({ success: true, is_active: false, message: 'Web manager not found' });
    }

    res.json({ success: true, is_active: webManager.is_active, NIC: webManager.NIC });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Status check failed', error: error.message });
  }
});

// UPDATE ADMIN PROFILE
app.put('/api/admin/profile', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
    const { full_name, password, current_password, profile_picture } = req.body;
    const User = getModel('User');
    const user = await User.findOne({ NIC: req.user.NIC });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (full_name) user.full_name = full_name;
    if (profile_picture) user.profile_picture = profile_picture;
    if (password) {
      if (!current_password) return res.status(400).json({ success: false, message: 'Current password required' });
      const isValid = await bcrypt.compare(current_password, user.password_hash);
      if (!isValid) return res.status(401).json({ success: false, message: 'Incorrect password' });
      user.password_hash = await bcrypt.hash(password, await bcrypt.genSalt(10));
    }
    user.updated_at = new Date();
    await user.save();
    res.json({ success: true, message: 'Profile updated', data: { NIC: user.NIC, full_name: user.full_name, email: user.email, profile_picture: user.profile_picture } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  }
});

// USER ANALYTICS
app.get('/api/admin/analytics/users', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
    const User = getModel('User');
    const CycleProfile = getModel('CycleProfile');
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [totalUsers, usersByRole, activeUsers, cycleUsers, userGrowth] = await Promise.all([
      User.countDocuments({}),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      User.countDocuments({ isExisting: 'active' }),
      CycleProfile ? CycleProfile.countDocuments({ is_active: true }) : 0,
      User.aggregate([{ $match: { created_at: { $gte: thirtyDaysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
    ]);
    res.json({ success: true, data: { total_users: totalUsers, active_users: activeUsers, cycle_users: cycleUsers, users_by_role: usersByRole, user_growth: userGrowth } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Analytics failed', error: error.message });
  }
});

// DONATION ANALYTICS
app.get('/api/admin/analytics/donations', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
    const CampaignDonation = getModel('CampaignDonation');
    if (!CampaignDonation) return res.json({ success: true, data: { total_donations: 0, total_amount: 0, donations_by_campaign: [], donation_trends: [] } });
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [totalStats, donationsByCampaign, donationTrends] = await Promise.all([
      CampaignDonation.aggregate([{ $group: { _id: null, total_amount: { $sum: '$amount' }, total_count: { $sum: 1 } } }]),
      CampaignDonation.aggregate([{ $group: { _id: '$campaign_id', total_amount: { $sum: '$amount' }, donor_count: { $sum: 1 } } }, { $lookup: { from: 'campaigns', localField: '_id', foreignField: 'campaign_id', as: 'campaign_info' } }, { $unwind: { path: '$campaign_info', preserveNullAndEmptyArrays: true } }, { $project: { campaign_id: '$_id', campaign_title: '$campaign_info.title', total_amount: 1, donor_count: 1 } }, { $sort: { total_amount: -1 } }]),
      CampaignDonation.aggregate([{ $match: { donated_at: { $gte: thirtyDaysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$donated_at' } }, amount: { $sum: '$amount' }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
    ]);
    res.json({ success: true, data: { total_amount: totalStats[0]?.total_amount || 0, total_donations: totalStats[0]?.total_count || 0, donations_by_campaign: donationsByCampaign, donation_trends: donationTrends } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Analytics failed', error: error.message });
  }
});

// POSTS/COMMENTS ANALYTICS
app.get('/api/admin/analytics/posts', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
    const Post = getModel('Post');
    const Comment = getModel('Comment');
    const Report = getModel('Report');
    if (!Post || !Comment) return res.json({ success: true, data: { total_posts: 0, total_comments: 0, posts_by_status: [] } });
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [totalPosts, totalComments, postsByStatus, totalReports, contentTrends] = await Promise.all([
      Post.countDocuments({}),
      Comment.countDocuments({}),
      Post.aggregate([{ $group: { _id: '$approval_status', count: { $sum: 1 } } }]),
      Report ? Report.countDocuments({ target_type: { $in: ['post', 'comment'] } }) : 0,
      Post.aggregate([{ $match: { created_at: { $gte: thirtyDaysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } }, posts: { $sum: 1 } } }, { $sort: { _id: 1 } }])
    ]);
    res.json({ success: true, data: { total_posts: totalPosts, total_comments: totalComments, total_reports: totalReports, posts_by_status: postsByStatus, content_trends: contentTrends } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Analytics failed', error: error.message });
  }
});

// WARNING HISTORY
app.get('/api/admin/warnings', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
    const Warning = getModel('Warning');
    if (!Warning) return res.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
    const { severity, user_nic, is_active, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (severity) filter.severity = severity;
    if (user_nic) filter.user_nic = user_nic;
    if (typeof is_active !== 'undefined') filter.is_active = is_active === 'true';
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const warnings = await Warning.aggregate([
      { $match: filter },
      { $lookup: { from: 'users', localField: 'user_nic', foreignField: 'NIC', as: 'user_info' } },
      { $unwind: { path: '$user_info', preserveNullAndEmptyArrays: true } },
      { $project: { warning_id: 1, user_nic: 1, reason: 1, severity: 1, given_by: 1, given_at: 1, expires_at: 1, is_active: 1, 'user_info.full_name': 1, 'user_info.email': 1 } },
      { $sort: { given_at: -1 } }, { $skip: skip }, { $limit: parseInt(limit) }
    ]);
    const total = await Warning.countDocuments(filter);
    res.json({ success: true, data: warnings, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fetch failed', error: error.message });
  }
});

// GET USERS BY ROLE
app.get('/api/admin/roles', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
    const User = getModel('User');
    const CycleProfile = getModel('CycleProfile');
    const { role, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [{ full_name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { NIC: { $regex: search, $options: 'i' } }];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter).select('NIC full_name email role isExisting gender created_at profile_picture').sort({ created_at: -1 }).skip(skip).limit(parseInt(limit));
    const usersWithCycle = await Promise.all(users.map(async (user) => {
      const cycleProfile = CycleProfile ? await CycleProfile.findOne({ NIC: user.NIC }) : null;
      return { ...user.toObject(), is_cycle_user: !!cycleProfile };
    }));
    const total = await User.countDocuments(filter);
    res.json({ success: true, data: usersWithCycle, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fetch failed', error: error.message });
  }
});

// UPDATE USER ROLE
app.put('/api/admin/roles/:nic', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
    const { role, isExisting } = req.body;
    const User = getModel('User');
    const updateData = { updated_at: new Date() };
    if (role) updateData.role = role;
    if (isExisting) updateData.isExisting = isExisting;
    const user = await User.findOneAndUpdate({ NIC: req.params.nic }, { $set: updateData }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    console.log(`✅ Role updated: ${req.params.nic} -> ${role}`);
    res.json({ success: true, message: 'Role updated', data: { NIC: user.NIC, full_name: user.full_name, email: user.email, role: user.role, isExisting: user.isExisting } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed', error: error.message });
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
