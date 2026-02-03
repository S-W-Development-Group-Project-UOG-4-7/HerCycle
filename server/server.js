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
const nodemailer = require('nodemailer'); // Added for email notifications

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
app.use("/api/cycle", require("./routes/cycleRoutes"));

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

// ========== EMAIL HELPER FUNCTION ==========
// Configure Nodemailer transporter (optional)
let emailTransporter = null;
try {
  emailTransporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'hercyle806@gmail.com',
      pass: 'your-app-password-here' // TODO: Replace with actual Gmail app password
    }
  });
  console.log('✅ Email transporter configured');
} catch (error) {
  console.warn('⚠️ Email disabled:', error.message);
}

// Send Warning Email
async function sendWarningEmail(userEmail, userName, warningDetails) {
  if (!emailTransporter) {
    console.log('📧 Email skipped (transporter not available)');
    return false;
  }
  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">⚠️ Warning Issued</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <p>Dear ${userName},</p>
          <p>You have received a warning from the HerCycle Admin Team.</p>
          
          <div style="background: white; border-left: 4px solid #ff6b6b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #ff6b6b;">Warning Details:</p>
            <p style="margin: 10px 0;"><strong>Severity:</strong> ${warningDetails.severity.toUpperCase()}</p>
            <p style="margin: 10px 0;"><strong>Reason:</strong> ${warningDetails.reason}</p>
            ${warningDetails.notes ? `<p style="margin: 10px 0;"><strong>Additional Notes:</strong> ${warningDetails.notes}</p>` : ''}
            <p style="margin: 10px 0;"><strong>Expires:</strong> ${new Date(warningDetails.expires_at).toLocaleDateString()}</p>
          </div>

          <div style="background: #fff3e0; border: 2px solid #ffecb3; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #f57c00;"><strong>⚠️ Important:</strong></p>
            <ul style="color: #666; margin: 10px 0;">
              <li>This is warning ${warningDetails.warning_count || 1} for your account</li>
              <li>Users with 3 or more warnings will be automatically suspended</li>
              <li>Please review our community guidelines and ensure future compliance</li>
            </ul>
          </div>

          <p>If you believe this warning was issued in error, please contact our support team.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>HerCycle Admin Team</p>
        </div>
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2026 HerCycle. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: '"HerCycle Team" <hercyle806@gmail.com>',
      to: userEmail,
      subject: `⚠️ Warning Issued - HerCycle`,
      html: emailContent
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Warning email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send warning email to ${userEmail}:`, error);
    return false;
  }
}
// ========== END EMAIL HELPER ==========

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

    // Update last_login timestamp
    user.last_login = new Date();
    await user.save();

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

    // ===== PHASE 3: Send approval email notification to doctor =====
    const { sendDoctorApprovalEmail } = require('./emailService');
    await sendDoctorApprovalEmail(user.email, user.full_name, doctor.specialty);

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

    // ===== PHASE 3: Send rejection email notification with reason =====
    const user = await User.findOne({ NIC: nic });
    if (user) {
      const { sendDoctorRejectionEmail } = require('./emailService');
      await sendDoctorRejectionEmail(user.email, user.full_name, reason);
    }

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
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor status',
      error: error.message
    });
  }
});

// ===== PHASE 3: DOCTOR MANAGEMENT ENDPOINTS =====
// These endpoints enhance admin capabilities for doctor verification workflow

// REQUEST MORE INFO FROM DOCTOR
// Allows admin to request additional information via email during verification
app.post('/api/admin/doctor/request-info', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { nic, message } = req.body;
    const User = getModel('User');
    const Doctor = getModel('Doctor');

    const user = await User.findOne({ NIC: nic });
    const doctor = await Doctor.findOne({ NIC: nic });

    if (!user || !doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const { sendDoctorInfoRequestEmail } = require('./emailService');
    await sendDoctorInfoRequestEmail(user.email, user.full_name, doctor.specialty, message);

    console.log(`✅ Info request sent to: ${user.email}`);
    res.json({ success: true, message: 'Information request sent successfully' });
  } catch (error) {
    console.error('Error sending info request:', error);
    res.status(500).json({ success: false, message: 'Failed to send request', error: error.message });
  }
});

// GET DOCTOR VERIFICATION HISTORY  
// Returns a comprehensive list of all doctors with their verification status and details
// Used by the Admin Dashboard "Verification History" tab for audit trail
app.get('/api/admin/doctor-verifications', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const DoctorVerification = getModel('DoctorVerification');
    const Doctor = getModel('Doctor');
    const User = getModel('User');

    const doctors = await Doctor.find({}).sort({ created_at: -1 }).limit(100);

    const doctorsWithUserInfo = await Promise.all(
      doctors.map(async (doctor) => {
        const user = await User.findOne({ NIC: doctor.NIC });
        const verification = await DoctorVerification.findOne({ doctor_NIC: doctor.NIC }).sort({ submitted_at: -1 });
        return {
          ...doctor.toObject(),
          user_name: user?.full_name || 'Unknown',
          user_email: user?.email || 'N/A',
          license_number: verification?.registration_details?.license_number || 'N/A',
          verified_at: doctor.activated_at
        };
      })
    );

    res.json({ success: true, data: doctorsWithUserInfo });
  } catch (error) {
    console.error('Error fetching verification history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch history', error: error.message });
  }
});

// GET ALL POSTS BY A SPECIFIC DOCTOR
// Allows admin to review a doctor's community contributions before approval
// Helps assess content quality and professional conduct
app.get('/api/admin/doctor-posts/:nic', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { nic } = req.params;
    const Post = getModel('Post');

    // Find posts where author is this doctor's NIC
    const posts = await Post.find({ author_nic: nic })
      .sort({ created_at: -1 })
      .limit(50); // Limit to recent 50 posts

    const postCount = await Post.countDocuments({ author_nic: nic });

    res.json({
      success: true,
      data: {
        posts: posts || [],
        total_count: postCount
      }
    });
  } catch (error) {
    console.error('Error fetching doctor posts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch doctor posts', error: error.message });
  }
});

// ===== PHASE 4: USER MANAGEMENT ENHANCEMENTS =====

// REACTIVATE SUSPENDED USER
app.post('/api/admin/reactivate-user', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { nic } = req.body;
    const User = getModel('User');

    const user = await User.findOneAndUpdate(
      { NIC: nic },
      {
        $set: {
          isSuspended: false,
          suspensionReason: null,
          updated_at: new Date()
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`✅ User reactivated: ${nic} by ${req.user.email}`);
    res.json({ success: true, message: 'User reactivated successfully', user });
  } catch (error) {
    console.error('❌ Reactivate user error:', error);
    res.status(500).json({ success: false, message: 'Failed to reactivate user', error: error.message });
  }
});

// GET USER WARNINGS HISTORY
app.get('/api/admin/user-warnings/:nic', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { nic } = req.params;
    const WarningHistory = getModel('WarningHistory');

    const warnings = await WarningHistory.find({ warned_user_nic: nic })
      .sort({ warned_at: -1 })
      .populate('admin_nic', 'full_name email');

    const totalCount = await WarningHistory.countDocuments({ warned_user_nic: nic });

    res.json({
      success: true,
      data: warnings,
      total_count: totalCount
    });
  } catch (error) {
    console.error('Error fetching user warnings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch warnings', error: error.message });
  }
});

// ===== PHASE 5: DATA EXPORT & REPORTING =====

// EXPORT DONATION REPORT AS PDF
app.get('/api/admin/export-donations', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const PDFDocument = require('pdfkit');
    const { startDate, endDate } = req.query;

    // Use CampaignDonation model from setup.js
    const CampaignDonation = mongoose.model('CampaignDonation');
    const Campaign = mongoose.model('Campaign');

    // Build query
    let query = {};
    if (startDate || endDate) {
      query.donated_at = {};
      if (startDate) query.donated_at.$gte = new Date(startDate);
      if (endDate) query.donated_at.$lte = new Date(endDate);
    }

    const donations = await CampaignDonation.find(query).sort({ donated_at: -1 });

    // Get campaign details
    const campaignIds = [...new Set(donations.map(d => d.campaign_id))];
    const campaigns = await Campaign.find({ campaign_id: { $in: campaignIds } });
    const campaignMap = {};
    campaigns.forEach(c => campaignMap[c.campaign_id] = c.title);

    const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=donations-report-${Date.now()}.pdf`);

    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('HerCycle Donation Report', { align: 'center' });
    doc.moveDown();

    // Report Details
    doc.fontSize(12).font('Helvetica');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'right' });
    if (startDate) doc.text(`From: ${new Date(startDate).toLocaleDateString()}`, { align: 'right' });
    if (endDate) doc.text(`To: ${new Date(endDate).toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    // Summary
    doc.fontSize(14).font('Helvetica-Bold').text('Summary');
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Donations: ${donations.length}`);
    doc.text(`Total Amount: Rs.${totalAmount.toFixed(2)}`);
    doc.moveDown();

    // Table Header
    doc.fontSize(12).font('Helvetica-Bold');
    const tableTop = doc.y;
    doc.text('Date', 50, tableTop);
    doc.text('Donor', 120, tableTop);
    doc.text('Campaign', 250, tableTop);
    doc.text('Amount', 420, tableTop);
    doc.moveDown();

    // Table Data
    doc.fontSize(10).font('Helvetica');
    donations.forEach((donation, i) => {
      const y = doc.y;
      if (y > 700) { // New page if needed
        doc.addPage();
      }

      doc.text(new Date(donation.donated_at).toLocaleDateString(), 50, y, { width: 65 });
      doc.text(donation.is_anonymous ? 'Anonymous' : donation.donor_name, 120, y, { width: 120 });
      doc.text(campaignMap[donation.campaign_id] || 'General', 250, y, { width: 160 });
      doc.text(`Rs.${donation.amount.toFixed(2)}`, 420, y);
      doc.moveDown(0.5);

    });

    doc.end();
    console.log(`✅ Donation PDF generated by ${req.user.email}`);
  } catch (error) {
    console.error('❌ Export donation error:', error);
    res.status(500).json({ success: false, message: 'Failed to export donations', error: error.message });
  }
});

// ==== ROLE PRIVILEGES MANAGEMENT ====

// Update Web Manager Permissions
app.put('/api/admin/web-manager/:nic/permissions', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { nic } = req.params;
    const { permissions } = req.body;

    const WebManager = mongoose.model('WebManager');
    const webManager = await WebManager.findOne({ NIC: nic });

    if (!webManager) {
      return res.status(404).json({ success: false, message: 'Web Manager not found' });
    }

    webManager.permissions = { ...webManager.permissions, ...permissions };
    await webManager.save();

    console.log(`✅ Updated permissions for Web Manager: ${nic}`);
    res.json({ success: true, message: 'Permissions updated successfully', data: webManager });
  } catch (error) {
    console.error('❌ Update permissions error:', error);
    res.status(500).json({ success: false, message: 'Failed to update permissions', error: error.message });
  }
});

// Get all web managers with permissions


// Update role-based privileges (for all users of a role)
app.put('/api/admin/role-privileges/:role', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { role } = req.params;
    const { privileges } = req.body;

    // For web_manager role, update all web managers
    if (role === 'web_manager') {
      const WebManager = mongoose.model('WebManager');
      await WebManager.updateMany({}, { $set: { permissions: privileges } });
      console.log(`✅ Updated permissions for all Web Managers`);
      return res.json({ success: true, message: 'Web Manager privileges updated for all users' });
    }

    // For other roles, we store in a system config (you could create a RoleConfig model)
    // For now, just return success
    console.log(`✅ Updated privileges for role: ${role}`, privileges);
    res.json({ success: true, message: `${role} privileges updated successfully` });
  } catch (error) {
    console.error('❌ Update role privileges error:', error);
    res.status(500).json({ success: false, message: 'Failed to update role privileges', error: error.message });
  }
});

// ===== PHASE 7: SYSTEM & UI POLISH =====

// DATABASE HEALTH CHECK
app.get('/api/admin/health', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const start = Date.now();
    const User = getModel('User');

    if (!User) {
      return res.json({ connected: false, latency: 0, database: 'Not connected' });
    }

    // Simple ping query
    await User.findOne().limit(1);
    const latency = Date.now() - start;

    res.json({
      connected: true,
      latency,
      database: process.env.MONGODB_URI ? 'MongoDB' : 'Unknown',
      timestamp: new Date()
    });
  } catch (error) {
    res.json({ connected: false, latency: 0, database: 'Error', error: error.message });
  }
});

// TOTAL WARNINGS ISSUED STATISTICS
app.get('/api/admin/stats/warnings-total', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // Use correct model name: 'Warning' not 'WarningHistory'
    const Warning = getModel('Warning');
    if (!Warning) {
      return res.status(500).json({
        success: false,
        message: 'Warning model not available'
      });
    }

    const total = await Warning.countDocuments();

    // Last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last_30_days = await Warning.countDocuments({
      given_at: { $gte: thirtyDaysAgo }
    });

    res.json({ success: true, data: { total, last_30_days } });
  } catch (error) {
    console.error('❌ Error fetching warning stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
  }
});

// CYCLE USER STATISTICS
app.get('/api/admin/stats/cycle-users', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const User = getModel('User');
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Assuming users with cycle tracking have a cycle_tracking field or similar
    // Adjust based on your actual schema
    const cycleUsers = await User.countDocuments({
      role: 'user',
      // Add your cycle tracking condition here, e.g.:
      // cycle_tracking_enabled: true
    });

    const percentage = totalUsers > 0 ? ((cycleUsers / totalUsers) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        total_users: totalUsers,
        cycle_users: cycleUsers,
        percentage: parseFloat(percentage)
      }
    });
  } catch (error) {
    console.error('Error fetching cycle stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// RECENT ACTIVITY FEED
app.get('/api/admin/recent-activity', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const limit = parseInt(req.query.limit) || 10;
    const activities = [];

    // Get recent warnings from database
    const Warning = getModel('Warning');
    if (Warning) {
      const recentWarnings = await Warning.find()
        .sort({ given_at: -1 })
        .limit(5)
        .lean();

      recentWarnings.forEach(w => {
        activities.push({
          type: 'warning',
          message: `Warning issued to user ${w.user_nic || 'Unknown'}`,
          timestamp: w.given_at,
          severity: w.severity,
          user_nic: w.user_nic
        });
      });
    }

    // Get recent doctor approvals from database (last 7 days)
    const Doctor = getModel('Doctor');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentDoctors = await Doctor.find({
      verified_at: { $gte: sevenDaysAgo }
    }).sort({ verified_at: -1 }).limit(5);

    recentDoctors.forEach(d => {
      activities.push({
        type: 'doctor_approval',
        message: `Doctor verified: ${d.NIC}`,
        timestamp: d.verified_at,
        user_nic: d.NIC
      });
    });

    // Get recent user suspensions from database
    const User = getModel('User');
    const recentSuspensions = await User.find({
      isExisting: 'suspended',
      updated_at: { $gte: sevenDaysAgo }
    }).sort({ updated_at: -1 }).limit(5);

    recentSuspensions.forEach(u => {
      activities.push({
        type: 'suspension',
        message: `User suspended: ${u.full_name || u.NIC}`,
        timestamp: u.updated_at,
        user_nic: u.NIC
      });
    });

    // Get recent user registrations from database
    const recentUsers = await User.find()
      .sort({ created_at: -1 })
      .limit(5)
      .lean();

    recentUsers.forEach(u => {
      activities.push({
        type: 'user_registration',
        message: `New user registered: ${u.full_name || u.email}`,
        timestamp: u.created_at,
        user_nic: u.NIC
      });
    });

    // Get recent posts from database (last 3 days)
    const Post = getModel('Post');
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentPosts = await Post.find({
      created_at: { $gte: threeDaysAgo }
    }).sort({ created_at: -1 }).limit(5);

    recentPosts.forEach(p => {
      activities.push({
        type: 'post_created',
        message: `New post: ${p.title?.substring(0, 50)}...`,
        timestamp: p.created_at,
        user_nic: p.author_nic
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ success: true, data: activities.slice(0, limit) });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity' });
  }
});

// ===== ADMIN ANALYTICS ENDPOINTS (DATABASE CONNECTED) =====

// DONATION ANALYTICS
app.get('/api/admin/analytics/donations', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const CampaignDonation = mongoose.model('CampaignDonation');
    const Campaign = mongoose.model('Campaign');

    // Get total donations and amount
    const totalStats = await CampaignDonation.aggregate([
      {
        $group: {
          _id: null,
          total_donations: { $sum: 1 },
          total_amount: { $sum: '$amount' }
        }
      }
    ]);

    // Get donations by campaign
    const donationsByCampaign = await CampaignDonation.aggregate([
      {
        $group: {
          _id: '$campaign_id',
          total_amount: { $sum: '$amount' },
          donor_count: { $sum: 1 }
        }
      },
      {
        $sort: { total_amount: -1 }
      }
    ]);

    // Get campaign titles
    const campaignIds = donationsByCampaign.map(d => d._id);
    const campaigns = await Campaign.find({ campaign_id: { $in: campaignIds } });
    const campaignMap = {};
    campaigns.forEach(c => campaignMap[c.campaign_id] = c.title);

    // Add campaign titles to results
    const donationsWithTitles = donationsByCampaign.map(d => ({
      campaign_id: d._id,
      campaign_title: campaignMap[d._id] || 'Unknown Campaign',
      total_amount: d.total_amount,
      donor_count: d.donor_count
    }));

    res.json({
      success: true,
      data: {
        total_donations: totalStats[0]?.total_donations || 0,
        total_amount: totalStats[0]?.total_amount || 0,
        donations_by_campaign: donationsWithTitles
      }
    });
  } catch (error) {
    console.error('Error fetching donation analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch donation analytics', error: error.message });
  }
});

// USER ANALYTICS
app.get('/api/admin/analytics/users', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const User = getModel('User');
    const Doctor = getModel('Doctor');
    const CycleProfile = getModel('CycleProfile');

    // Total users count
    const total_users = await User.countDocuments();

    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const active_users = await User.countDocuments({
      last_login: { $gte: thirtyDaysAgo }
    });

    // Cycle tracking users
    const cycle_users = await CycleProfile.countDocuments({ is_active: true });

    // Verified doctors
    const verified_doctors = await Doctor.countDocuments({
      is_approved: true,
      verified: true
    });

    // New users this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    const new_users_this_month = await User.countDocuments({
      created_at: { $gte: firstDayOfMonth }
    });

    // Users by role distribution
    const users_by_role = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total_users,
        active_users,
        cycle_users,
        verified_doctors,
        new_users_this_month,
        users_by_role
      }
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user analytics', error: error.message });
  }
});

// USER GROWTH ANALYTICS
app.get('/api/admin/analytics/user-growth', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const days = parseInt(req.query.days) || 30;
    const User = getModel('User');

    let startDate;
    if (days === 'all' || days > 365) {
      // Get the earliest user registration date
      const earliestUser = await User.findOne().sort({ created_at: 1 });
      startDate = earliestUser ? earliestUser.created_at : new Date();
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
    }

    // Aggregate users by day
    const growthData = await User.aggregate([
      {
        $match: {
          created_at: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Calculate cumulative count
    let cumulative = 0;
    const growth = growthData.map(item => {
      cumulative += item.count;
      return {
        date: item._id,
        count: item.count,
        cumulative: cumulative
      };
    });

    res.json({
      success: true,
      data: {
        growth
      }
    });
  } catch (error) {
    console.error('Error fetching user growth:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user growth', error: error.message });
  }
});

// POST/COMMENT ANALYTICS
app.get('/api/admin/analytics/posts', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const Post = getModel('Post');
    const Comment = getModel('Comment');
    const Report = getModel('Report');

    // Total posts
    const total_posts = await Post.countDocuments();

    // Total comments
    const total_comments = await Comment.countDocuments();

    // Total reports
    const total_reports = await Report.countDocuments();

    // Comment to post ratio
    const comment_to_post_ratio = total_posts > 0 ? total_comments / total_posts : 0;

    // Posts by status
    const posts_by_status = await Post.aggregate([
      {
        $group: {
          _id: '$approval_status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total_posts,
        total_comments,
        total_reports,
        comment_to_post_ratio,
        posts_by_status
      }
    });
  } catch (error) {
    console.error('Error fetching post analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch post analytics', error: error.message });
  }
});

// GET ALL WARNINGS (with filters)
app.get('/api/admin/warnings', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const Warning = getModel('Warning');
    const User = getModel('User');
    const { severity, user_nic, is_active } = req.query;

    // Build query
    let query = {};
    if (severity) query.severity = severity;
    if (user_nic) query.user_nic = user_nic;
    if (is_active) query.is_active = is_active === 'true';

    const warnings = await Warning.find(query).sort({ given_at: -1 }).limit(100);

    // Get user info for each warning
    const warningsWithUserInfo = await Promise.all(
      warnings.map(async (warning) => {
        const user = await User.findOne({ NIC: warning.user_nic });
        return {
          ...warning.toObject(),
          user_info: user ? {
            full_name: user.full_name,
            email: user.email
          } : null
        };
      })
    );

    res.json({ success: true, data: warningsWithUserInfo });
  } catch (error) {
    console.error('Error fetching warnings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch warnings', error: error.message });
  }
});

// GET SUSPENDED USERS
app.get('/api/admin/suspended-users', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const User = getModel('User');
    const Warning = getModel('Warning');

    // Find users with isExisting = 'suspended'
    const suspendedUsers = await User.find({
      isExisting: 'suspended'
    }).select('NIC full_name email suspension_end created_at');

    // Get warning count for each suspended user
    const usersWithWarnings = await Promise.all(
      suspendedUsers.map(async (user) => {
        const warning_count = await Warning.countDocuments({ user_nic: user.NIC });
        return {
          NIC: user.NIC,
          full_name: user.full_name,
          email: user.email,
          suspension_end: user.suspension_end,
          warning_count
        };
      })
    );

    res.json({ success: true, data: usersWithWarnings });
  } catch (error) {
    console.error('Error fetching suspended users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suspended users', error: error.message });
  }
});

// SUSPEND USER
app.post('/api/admin/suspend-user', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { user_nic, duration } = req.body;
    const User = getModel('User');

    // Calculate suspension end date based on duration
    const now = new Date();
    let suspension_end = new Date(now);

    switch (duration) {
      case '1week':
        suspension_end.setDate(suspension_end.getDate() + 7);
        break;
      case '3weeks':
        suspension_end.setDate(suspension_end.getDate() + 21);
        break;
      case '1month':
        suspension_end.setMonth(suspension_end.getMonth() + 1);
        break;
      case '3months':
        suspension_end.setMonth(suspension_end.getMonth() + 3);
        break;
      default:
        suspension_end.setDate(suspension_end.getDate() + 7); // Default to 1 week
    }

    // Update user status
    const user = await User.findOneAndUpdate(
      { NIC: user_nic },
      {
        $set: {
          isExisting: 'suspended',
          suspension_end: suspension_end,
          updated_at: new Date()
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`✅ User ${user_nic} suspended until ${suspension_end} by ${req.user.email}`);
    res.json({
      success: true,
      message: `User suspended for ${duration}`,
      data: { suspension_end }
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ success: false, message: 'Failed to suspend user', error: error.message });
  }
});

// UNSUSPEND USER
app.post('/api/admin/unsuspend-user', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { user_nic } = req.body;
    const User = getModel('User');

    const user = await User.findOneAndUpdate(
      { NIC: user_nic },
      {
        $set: {
          isExisting: 'active',
          suspension_end: null,
          updated_at: new Date()
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`✅ User ${user_nic} unsuspended by ${req.user.email}`);
    res.json({ success: true, message: 'User unsuspended successfully' });
  } catch (error) {
    console.error('Error unsuspending user:', error);
    res.status(500).json({ success: false, message: 'Failed to unsuspend user', error: error.message });
  }
});

// GIVE WARNING
app.post('/api/admin/give-warning', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { user_nic, reason, severity, notes, post_id, comment_id } = req.body;
    const Warning = getModel('Warning');
    const User = getModel('User');

    // Calculate expiration (warnings expire after 90 days by default)
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 90);

    // Create warning
    const warning = new Warning({
      warning_id: `WARN_${Date.now()}_${user_nic}`,
      user_nic,
      reason,
      severity: severity || 'medium',
      given_by: req.user.email,
      expires_at,
      notes,
      post_id,
      comment_id,
      is_active: true,
      given_at: new Date()
    });

    await warning.save();

    // Send warning email if available
    const user = await User.findOne({ NIC: user_nic });
    if (user && user.email) {
      const warningCount = await Warning.countDocuments({ user_nic });
      try {
        await sendWarningEmail(user.email, user.full_name, {
          severity,
          reason,
          notes,
          expires_at,
          warning_count: warningCount
        });
      } catch (emailError) {
        console.log('Warning email failed:', emailError.message);
      }
    }

    console.log(`✅ Warning issued to ${user_nic} by ${req.user.email}`);
    res.json({ success: true, message: 'Warning issued successfully', data: warning });
  } catch (error) {
    console.error('Error giving warning:', error);
    res.status(500).json({ success: false, message: 'Failed to give warning', error: error.message });
  }
});

// GET SUSPENDED USERS
app.get('/api/admin/suspended-users', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const User = getModel('User');
    const Warning = getModel('Warning');

    // Find users who are currently suspended
    const suspendedUsers = await User.find({
      isExisting: 'suspended',
      suspension_end: { $exists: true, $ne: null }
    }).select('NIC full_name email isExisting suspension_end created_at').lean();

    // Attach warning count to each user
    const usersWithWarnings = await Promise.all(
      suspendedUsers.map(async (user) => {
        const warningCount = await Warning.countDocuments({ user_nic: user.NIC, is_active: true });
        return {
          ...user,
          warning_count: warningCount
        };
      })
    );

    res.json({ success: true, data: usersWithWarnings });
  } catch (error) {
    console.error('Error fetching suspended users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suspended users', error: error.message });
  }
});

// GET RECENT ADMIN ACTIVITY
app.get('/api/admin/recent-activity', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const limit = parseInt(req.query.limit) || 10;
    const Warning = getModel('Warning');
    const User = getModel('User');
    const Doctor = getModel('Doctor');

    const activities = [];

    // Get recent warnings (not for suspended users)
    const recentWarnings = await Warning.find({ is_active: true })
      .sort({ given_at: -1 })
      .limit(limit)
      .lean();

    for (const warning of recentWarnings) {
      const user = await User.findOne({ NIC: warning.user_nic }).select('full_name isExisting');

      // Skip if user is suspended
      if (user && user.isExisting !== 'suspended') {
        activities.push({
          type: 'warning',
          message: `Warning issued to ${user.full_name || warning.user_nic} - ${warning.reason}`,
          timestamp: warning.given_at
        });
      }
    }

    // Get recent doctor approvals
    if (Doctor) {
      const recentDoctorApprovals = await Doctor.find({
        verification_status: { $in: ['approved', 'rejected'] }
      })
        .sort({ verification_date: -1 })
        .limit(5)
        .lean();

      for (const doctor of recentDoctorApprovals) {
        const user = await User.findOne({ NIC: doctor.NIC }).select('full_name');
        activities.push({
          type: doctor.verification_status === 'approved' ? 'doctor_approval' : 'doctor_rejection',
          message: `Doctor ${user?.full_name || doctor.NIC} ${doctor.verification_status}`,
          timestamp: doctor.verification_date || doctor.registered_at
        });
      }
    }

    // Get recent suspensions
    const recentSuspensions = await User.find({
      isExisting: 'suspended',
      updated_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    })
      .sort({ updated_at: -1 })
      .limit(5)
      .select('full_name NIC updated_at')
      .lean();

    for (const user of recentSuspensions) {
      activities.push({
        type: 'suspension',
        message: `User ${user.full_name || user.NIC} suspended`,
        timestamp: user.updated_at
      });
    }

    // Sort all activities by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, limit);

    res.json({ success: true, data: limitedActivities });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity', error: error.message });
  }
});

// TOP TOPICS (for widget)
app.get('/api/admin/top-topics', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const Post = getModel('Post');

    // Get top categories/tags by post count
    const topCategories = await Post.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Format for widget
    const topics = topCategories.map(cat => ({
      name: cat._id || 'General',
      count: cat.count
    }));

    res.json({ success: true, data: topics });
  } catch (error) {
    console.error('Error fetching top topics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch top topics', error: error.message });
  }
});

// ===== PHASE 8: ADVANCED FEATURES =====



// BULK SUSPEND USERS
app.post('/api/admin/bulk-suspend', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { nics, reason } = req.body;

    if (!nics || !Array.isArray(nics) || nics.length === 0) {
      return res.status(400).json({ success: false, message: 'NICs array required' });
    }

    const User = getModel('User');
    const result = await User.updateMany(
      { NIC: { $in: nics } },
      {
        $set: {
          isSuspended: true,
          suspensionReason: reason || 'Bulk suspension by admin',
          updated_at: new Date()
        }
      }
    );

    console.log(`✅ Bulk suspended ${result.modifiedCount} users by ${req.user.email}`);
    res.json({
      success: true,
      message: `${result.modifiedCount} users suspended`,
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk suspending:', error);
    res.status(500).json({ success: false, message: 'Failed to suspend users' });
  }
});

// BULK ACTIVATE USERS
app.post('/api/admin/bulk-activate', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { nics } = req.body;

    if (!nics || !Array.isArray(nics) || nics.length === 0) {
      return res.status(400).json({ success: false, message: 'NICs array required' });
    }

    const User = getModel('User');
    const result = await User.updateMany(
      { NIC: { $in: nics } },
      {
        $set: {
          isSuspended: false,
          suspensionReason: null,
          updated_at: new Date()
        }
      }
    );

    console.log(`✅ Bulk activated ${result.modifiedCount} users by ${req.user.email}`);
    res.json({
      success: true,
      message: `${result.modifiedCount} users activated`,
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk activating:', error);
    res.status(500).json({ success: false, message: 'Failed to activate users' });
  }
});

// REVOKE DOCTOR VERIFICATION
app.post('/api/admin/revoke-doctor/:nic', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { nic } = req.params;
    const { reason } = req.body;

    const Doctor = getModel('Doctor');
    const doctor = await Doctor.findOneAndUpdate(
      { NIC: nic },
      {
        $set: {
          is_verified: false,
          verification_status: 'revoked',
          revoked_at: new Date(),
          revoke_reason: reason || 'Revoked by admin'
        }
      },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    console.log(`✅ Doctor verification revoked: ${nic} by ${req.user.email}`);
    res.json({ success: true, message: 'Doctor verification revoked', data: doctor });
  } catch (error) {
    console.error('Error revoking doctor:', error);
    res.status(500).json({ success: false, message: 'Failed to revoke verification' });
  }
});

// MOST ENGAGED TOPICS/CATEGORIES
app.get('/api/admin/stats/top-topics', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const limit = parseInt(req.query.limit) || 5;
    const Post = getModel('Post');

    // Aggregate posts by category/topic
    const topTopics = await Post.aggregate([
      { $match: { category: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$category',
          post_count: { $sum: 1 },
          total_likes: { $sum: '$like_count' },
          total_comments: { $sum: '$comment_count' }
        }
      },
      {
        $project: {
          category: '$_id',
          post_count: 1,
          engagement: { $add: ['$total_likes', '$total_comments'] }
        }
      },
      { $sort: { engagement: -1 } },
      { $limit: limit }
    ]);

    res.json({ success: true, data: topTopics });
  } catch (error) {
    console.error('Error fetching top topics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch topics' });
  }
});

// ========== END ADMIN ROUTES ==========


// ========== ADMIN ANALYTICS ENDPOINTS ==========
// USER GROWTH ANALYTICS
app.get('/api/admin/analytics/user-growth', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const User = getModel('User');
    if (!User) {
      return res.json({ success: true, data: { growth: [], total_new_users: 0, date_range: 'all' } });
    }

    const { days } = req.query;
    let dateFilter = {};
    let dateRange = 'all';

    if (days && days !== 'all') {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      dateFilter = { created_at: { $gte: daysAgo } };
      dateRange = days;
    }

    // Get daily user counts
    const dailyUsers = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate cumulative counts
    let cumulative = 0;
    if (days && days !== 'all') {
      // Get users before the date range for accurate cumulative count
      const usersBeforeRange = await User.countDocuments({
        created_at: { $lt: dateFilter.created_at.$gte }
      });
      cumulative = usersBeforeRange;
    }

    const growthData = dailyUsers.map(day => {
      cumulative += day.count;
      return {
        date: day._id,
        count: day.count,
        cumulative: cumulative
      };
    });

    const totalNewUsers = dailyUsers.reduce((sum, day) => sum + day.count, 0);

    res.json({
      success: true,
      data: {
        growth: growthData,
        total_new_users: totalNewUsers,
        date_range: dateRange
      }
    });
  } catch (error) {
    console.error('❌ User growth analytics error:', error);
    res.status(500).json({ success: false, message: 'Analytics failed', error: error.message });
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

// DELETE WEB MANAGER (Cascade delete from both collections)
app.delete('/api/admin/web-managers/:nic', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const WebManager = getModel('WebManager');
    const User = getModel('User');

    // Delete from WebManager collection
    const webManager = await WebManager.findOneAndDelete({ NIC: req.params.nic });

    if (!webManager) {
      return res.status(404).json({ success: false, message: 'Web manager not found' });
    }

    // Cascade delete from User collection
    await User.findOneAndDelete({ NIC: req.params.nic });

    console.log(`✅ Deleted web manager: ${req.params.nic}`);
    res.json({
      success: true,
      message: 'Web manager deleted successfully',
      deleted_nic: req.params.nic
    });
  } catch (error) {
    console.error('❌ Delete web manager error:', error);
    res.status(500).json({ success: false, message: 'Delete failed', error: error.message });
  }
});

// REACTIVATE WEB MANAGER
app.post('/api/admin/web-managers/:nic/reactivate', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const WebManager = getModel('WebManager');
    const User = getModel('User');

    // Reactivate in WebManager collection
    const webManager = await WebManager.findOneAndUpdate(
      { NIC: req.params.nic },
      { $set: { is_active: true } },
      { new: true }
    );

    if (!webManager) {
      return res.status(404).json({ success: false, message: 'Web manager not found' });
    }

    // Reactivate in User collection
    await User.findOneAndUpdate(
      { NIC: req.params.nic },
      { $set: { isExisting: 'active' } }
    );

    console.log(`✅ Reactivated web manager: ${req.params.nic}`);
    res.json({
      success: true,
      message: 'Web manager reactivated successfully',
      data: webManager
    });
  } catch (error) {
    console.error('❌ Reactivate web manager error:', error);
    res.status(500).json({ success: false, message: 'Reactivation failed', error: error.message });
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
    const Doctor = getModel('Doctor');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      usersByRole,
      activeUsers,
      cycleUsers,
      verifiedDoctors,
      newUsersThisMonth,
      userGrowth
    ] = await Promise.all([
      User.countDocuments({}),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      User.countDocuments({ isExisting: 'active' }),
      CycleProfile ? CycleProfile.countDocuments({ is_active: true }) : 0,
      Doctor ? Doctor.countDocuments({}) : 0,
      User.countDocuments({ created_at: { $gte: firstDayOfMonth } }),
      User.aggregate([
        { $match: { created_at: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total_users: totalUsers,
        active_users: activeUsers,
        cycle_users: cycleUsers,
        verified_doctors: verifiedDoctors,
        new_users_this_month: newUsersThisMonth,
        users_by_role: usersByRole,
        user_growth: userGrowth
      }
    });
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

// ========== HYBRID WARNING SYSTEM (Approach 4) ==========

// HELPER FUNCTION: Issue Auto-Warning
async function issueAutoWarning(userNic, reason, severity = 'low', sourceType = 'auto', sourceId = null) {
  try {
    const Warning = getModel('Warning');
    const CommunityMember = getModel('CommunityMember');
    const User = getModel('User');

    if (!Warning || !CommunityMember || !User) {
      console.error('❌ Models not available for auto-warning');
      return null;
    }

    // Create warning
    const warning = new Warning({
      warning_id: `WARN_${Date.now()}_${userNic}`,
      user_nic: userNic,
      reason: reason,
      severity: severity,
      given_by: sourceType === 'auto' ? 'SYSTEM' : sourceId,
      is_active: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      notes: sourceType === 'auto' ? 'Auto-generated warning based on system rules' : null
    });

    await warning.save();
    console.log(`✅ Auto-warning issued to ${userNic}: ${reason}`);

    // Update warning count in CommunityMember
    const member = await CommunityMember.findOne({ NIC: userNic });
    if (member) {
      member.warning_count = (member.warning_count || 0) + 1;
      await member.save();

      // Check for auto-suspension (3 warnings = suspend)
      if (member.warning_count >= 3) {
        await User.findOneAndUpdate(
          { NIC: userNic },
          { isExisting: 'suspended' }
        );
        console.log(`⚠️ User ${userNic} auto-suspended (3+ warnings)`);

        // TODO: Send suspension email notification
      }
    }

    return warning;
  } catch (error) {
    console.error('❌ Auto-warning error:', error);
    return null;
  }
}

// MANUAL WARNING CREATION
app.post('/api/admin/give-warning', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { user_nic, reason, severity, post_id, comment_id, notes, duration_days } = req.body;

    if (!user_nic || !reason || !severity) {
      return res.status(400).json({ success: false, message: 'user_nic, reason, and severity are required' });
    }

    const Warning = getModel('Warning');
    const CommunityMember = getModel('CommunityMember');
    const User = getModel('User');

    // Verify user exists
    const user = await User.findOne({ NIC: user_nic });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate expiration
    const expiresAt = duration_days
      ? new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

    // Create warning
    const warning = new Warning({
      warning_id: `WARN_${Date.now()}_${user_nic}`,
      user_nic: user_nic,
      post_id: post_id || undefined,
      comment_id: comment_id || undefined,
      reason: reason,
      severity: severity,
      given_by: req.user.email,
      is_active: true,
      expires_at: expiresAt,
      notes: notes || ''
    });

    await warning.save();

    // Update warning count
    const member = await CommunityMember.findOne({ NIC: user_nic });
    if (member) {
      member.warning_count = (member.warning_count || 0) + 1;
      await member.save();

      // Check for auto-suspension
      if (member.warning_count >= 3) {
        await User.findOneAndUpdate(
          { NIC: user_nic },
          { isExisting: 'suspended' }
        );
        console.log(`⚠️ User ${user_nic} suspended (3+ warnings)`);
      }
    } else {
      // Create community member if doesn't exist
      const newMember = new CommunityMember({
        NIC: user_nic,
        warning_count: 1,
        is_active: true
      });
      await newMember.save();
    }

    console.log(`✅ Manual warning issued to ${user_nic} by ${req.user.email}`);

    // Send warning email  notification
    await sendWarningEmail(user.email, user.full_name, {
      severity: warning.severity,
      reason: warning.reason,
      notes: warning.notes,
      expires_at: warning.expires_at,
      warning_count: member ? member.warning_count : 1
    });

    res.status(201).json({
      success: true,
      message: 'Warning issued successfully',
      data: warning
    });

  } catch (error) {
    console.error('❌ Issue warning error:', error);
    res.status(500).json({ success: false, message: 'Failed to issue warning', error: error.message });
  }
});

// SUSPEND USER ENDPOINT
app.post('/api/admin/suspend-user', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { user_nic, duration } = req.body;

    if (!user_nic || !duration) {
      return res.status(400).json({ success: false, message: 'user_nic and duration are required' });
    }

    const User = getModel('User');
    const user = await User.findOne({ NIC: user_nic });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate suspension end date
    const durationMap = {
      '1week': 7,
      '3weeks': 21,
      '1month': 30,
      '3months': 90
    };

    const days = durationMap[duration] || 7;
    const suspensionEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    // Update user status
    user.isExisting = 'suspended';
    user.suspension_end = suspensionEnd; // Note: This field may not exist in schema, but won't cause error
    await user.save();

    console.log(`✅ User ${user_nic} suspended for ${duration} by ${req.user.email}`);

    res.json({
      success: true,
      message: `User suspended for ${duration}`,
      data: {
        user_nic: user_nic,
        suspended_until: suspensionEnd
      }
    });

  } catch (error) {
    console.error('❌ Suspend user error:', error);
    res.status(500).json({ success: false, message: 'Failed to suspend user', error: error.message });
  }
});

// REPORT-TO-WARNING CONVERSION
app.post('/api/admin/reports/:id/issue-warning', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'web_manager') {
      return res.status(403).json({ success: false, message: 'Admin or Web Manager access required' });
    }

    const { severity, notes, duration_days } = req.body;
    const reportId = req.params.id;

    const Report = getModel('Report');
    const Warning = getModel('Warning');
    const CommunityMember = getModel('CommunityMember');
    const User = getModel('User');

    // Get the report
    const report = await Report.findOne({ report_id: reportId });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Determine target user NIC based on report type
    let targetNic = null;
    if (report.target_type === 'user') {
      targetNic = report.target_id;
    } else if (report.target_type === 'post') {
      const Post = getModel('Post');
      const post = await Post.findOne({ post_id: report.target_id });
      targetNic = post?.author_nic;
    } else if (report.target_type === 'comment') {
      const Comment = getModel('Comment');
      const comment = await Comment.findOne({ comment_id: report.target_id });
      targetNic = comment?.nic;
    }

    if (!targetNic) {
      return res.status(400).json({ success: false, message: 'Could not determine target user from report' });
    }

    // Calculate expiration
    const expiresAt = duration_days
      ? new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create warning linked to report
    const warning = new Warning({
      warning_id: `WARN_${Date.now()}_${targetNic}`,
      user_nic: targetNic,
      post_id: report.target_type === 'post' ? report.target_id : undefined,
      comment_id: report.target_type === 'comment' ? report.target_id : undefined,
      reason: `Report action: ${report.reason}`,
      severity: severity || 'medium',
      given_by: req.user.email,
      is_active: true,
      expires_at: expiresAt,
      notes: notes || `Issued from report ${reportId}`
    });

    await warning.save();

    // Update report status
    report.status = 'resolved';
    report.action_taken = `Warning issued (${severity || 'medium'} severity)`;
    report.reviewed_by = req.user.NIC;
    report.reviewed_at = new Date();
    await report.save();

    // Update warning count
    const member = await CommunityMember.findOne({ NIC: targetNic });
    if (member) {
      member.warning_count = (member.warning_count || 0) + 1;
      await member.save();

      // Check for auto-suspension
      if (member.warning_count >= 3) {
        await User.findOneAndUpdate(
          { NIC: targetNic },
          { isExisting: 'suspended' }
        );
        console.log(`⚠️ User ${targetNic} suspended (3+ warnings)`);
      }
    }

    console.log(`✅ Warning issued from report ${reportId} to user ${targetNic}`);

    res.status(201).json({
      success: true,
      message: 'Warning issued from report',
      data: { warning, report }
    });

  } catch (error) {
    console.error('❌ Report-to-warning error:', error);
    res.status(500).json({ success: false, message: 'Failed to issue warning from report', error: error.message });
  }
});

// ========== END HYBRID WARNING SYSTEM ==========

// GET SUSPENDED USERS
app.get('/api/admin/suspended-users', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const User = getModel('User');
    const CommunityMember = getModel('CommunityMember');

    if (!User) {
      return res.json({ success: true, data: [] });
    }

    // Find all suspended users
    const suspendedUsers = await User.find({ isExisting: 'suspended' })
      .select('NIC full_name email suspension_end created_at')
      .lean();

    // Get warning counts for each user
    const usersWithWarnings = await Promise.all(
      suspendedUsers.map(async (user) => {
        const member = await CommunityMember.findOne({ NIC: user.NIC });
        return {
          ...user,
          warning_count: member?.warning_count || 0,
          suspension_end: user.suspension_end || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days if not set
        };
      })
    );

    res.json({ success: true, data: usersWithWarnings });
  } catch (error) {
    console.error('❌ Fetch suspended users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suspended users', error: error.message });
  }
});

// UNSUSPEND USER (Auto or Manual)
app.post('/api/admin/unsuspend-user', authenticateToken, checkDatabaseReady, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { user_nic } = req.body;

    if (!user_nic) {
      return res.status(400).json({ success: false, message: 'user_nic is required' });
    }

    const User = getModel('User');
    const user = await User.findOne({ NIC: user_nic });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Unsuspend user
    user.isExisting = 'existing';
    user.suspension_end = null;
    await user.save();

    console.log(`✅ User ${user_nic} unsuspended by ${req.user.email}`);

    res.json({
      success: true,
      message: 'User unsuspended successfully',
      data: { user_nic: user_nic }
    });

  } catch (error) {
    console.error('❌ Unsuspend user error:', error);
    res.status(500).json({ success: false, message: 'Failed to unsuspend user', error: error.message });
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

// CREATE OR UPDATE CYCLE PROFILE
app.post('/api/cycle/profile', checkDatabaseReady, async (req, res) => {
  try {
    const CycleProfile = getModel('CycleProfile');

    if (!CycleProfile) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const {
      NIC,
      cycle_length,
      period_length,
      tracking_preferences,
      privacy_settings
    } = req.body;

    if (!NIC) {
      return res.status(400).json({
        success: false,
        message: 'NIC is required'
      });
    }

    const updated = await CycleProfile.findOneAndUpdate(
      { NIC },
      {
        $set: {
          cycle_length: cycle_length ?? 28,
          period_length: period_length ?? 5,
          tracking_preferences: tracking_preferences ?? {},
          privacy_settings: privacy_settings ?? {},
          updated_at: new Date()
        },
        $setOnInsert: {
          NIC,
          activated_at: new Date(),
          is_active: true,
          is_anonymized: false,
          created_at: new Date()
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Cycle profile saved',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
// DELETE DAILY LOG
app.delete('/api/cycle/daily-log/:id', checkDatabaseReady, async (req, res) => {
  try {
    const DailyLog = getModel('DailyLog');
    if (!DailyLog) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const deleted = await DailyLog.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Daily log not found' });
    }

    res.json({
      success: true,
      message: 'Daily log deleted',
      data: deleted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE CYCLE TRACKER ENTRY
app.delete('/api/cycle/tracker/:id', checkDatabaseReady, async (req, res) => {
  try {
    const CycleTracker = getModel('CycleTracker');
    if (!CycleTracker) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const deleted = await CycleTracker.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Cycle tracker entry not found' });
    }

    res.json({
      success: true,
      message: 'Cycle tracker deleted',
      data: deleted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//

// ADD CYCLE TRACKER ENTRY
app.post('/api/cycle/tracker', checkDatabaseReady, async (req, res) => {
  try {
    const CycleTracker = getModel('CycleTracker');

    if (!CycleTracker) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const { NIC, period_start_date, period_end_date, notes } = req.body;

    if (!NIC || !period_start_date) {
      return res.status(400).json({
        success: false,
        message: 'NIC and period_start_date are required'
      });
    }

    const tracker = new CycleTracker({
      tracker_id: `TRK_${Date.now()}_${NIC}`,
      NIC,
      period_start_date: new Date(period_start_date),
      period_end_date: period_end_date ? new Date(period_end_date) : null,
      notes: notes || '',
      created_at: new Date(),
      updated_at: new Date()
    });

    await tracker.save();

    res.json({
      success: true,
      message: 'Cycle tracker saved',
      data: tracker
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


//ISURI

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
