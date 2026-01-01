const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Add bcrypt for password hashing

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// ========== MONGODB CONNECTION ==========

// MongoDB Schemas

// 1. Experience Schema (Feedback)
const experienceSchema = new mongoose.Schema({
    name: { type: String, default: 'Anonymous' },
    email: { type: String, required: true },
    experience: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
});

const Experience = mongoose.model('Experience', experienceSchema);

// 2. Staff Schema for authentication
const staffSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        default: 'staff',
        enum: ['staff', 'admin']
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Hash password before saving
staffSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
staffSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const Staff = mongoose.model('Staff', staffSchema);

// Create default staff user if none exists
async function createDefaultStaff() {
    try {
        const staffCount = await Staff.countDocuments();
        if (staffCount === 0) {
            const defaultStaff = new Staff({
                email: 'admin@hercycle.com',
                password: 'admin123', // Will be hashed by pre-save hook
                name: 'Admin User',
                role: 'admin'
            });
            await defaultStaff.save();
            console.log('✅ Created default staff user');
            console.log('📧 Email: admin@hercycle.com');
            console.log('🔑 Password: admin123');
        }
    } catch (error) {
        console.error('Error creating default staff:', error);
    }
}

// MongoDB Connection
const mongoUri = 'mongodb+srv://hercycle806_db_user:GphmSbT0gGznlqxB@hercycle.8ijqlb7.mongodb.net/hercycle?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔗 Connecting to MongoDB Atlas...');

mongoose.connect(mongoUri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => {
    console.log('✅ Connected to MongoDB Atlas!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    createDefaultStaff(); // Call to create default staff user
})
.catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('⚠️  Starting with in-memory fallback...');
});

// ========== API ROUTES ==========

// POST /api/experiences - Create feedback
app.post('/api/experiences', async (req, res) => {
    try {
        const { name, email, experience, rating } = req.body;
        
        // Validation
        if (!experience || !rating) {
            return res.status(400).json({ 
                error: 'Experience and rating are required' 
            });
        }
        
        // Create new experience document
        const newExp = new Experience({
            name: name || 'Anonymous',
            email: email || 'no-email@example.com',
            experience: experience,
            rating: Number(rating) || 5
        });
        
        // Save to MongoDB
        const savedExp = await newExp.save();
        
        console.log(`✅ Saved to MongoDB: ${savedExp._id} - ${savedExp.name}`);
        console.log('📝 Document ID:', savedExp._id);
        
        res.status(201).json(savedExp);
        
    } catch (error) {
        console.error('❌ MongoDB save error:', error);
        res.status(500).json({ error: 'Database error: ' + error.message });
    }
});

// GET /api/experiences - Get all feedbacks from MongoDB
app.get('/api/experiences', async (req, res) => {
    try {
        const experiences = await Experience.find()
            .sort({ createdAt: -1 }) // Newest first
            .limit(100); // Limit to 100 results
        
        console.log(`📊 Returning ${experiences.length} feedbacks from MongoDB`);
        res.json(experiences);
        
    } catch (error) {
        console.error('❌ MongoDB fetch error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// PUT /api/experiences/:id - Update feedback in MongoDB
app.put('/api/experiences/:id', async (req, res) => {
    try {
        const updated = await Experience.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updated) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        
        console.log(`✏️ Updated in MongoDB: ${req.params.id}`);
        res.json(updated);
        
    } catch (error) {
        console.error('❌ MongoDB update error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE /api/experiences/:id - Delete from MongoDB
app.delete('/api/experiences/:id', async (req, res) => {
    try {
        const deleted = await Experience.findByIdAndDelete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        
        console.log(`🗑️ Deleted from MongoDB: ${req.params.id}`);
        res.json({ message: 'Deleted successfully' });
        
    } catch (error) {
        console.error('❌ MongoDB delete error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Import Contact model (add at the top with other imports)
// If you have the Contact model file, require it:
// const Contact = require('./models/Contact');
// Or define it in server.js:

// Contact Schema and Model (add after Experience schema)
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, default: '' },
    message: { type: String, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'read', 'responded', 'archived'] },
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// ========== CONTACT API ROUTES ==========

// POST /api/contacts - Create new contact message
app.post('/api/contacts', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false,
                message: 'Name, email, and message are required' 
            });
        }
        
        // Create new contact document
        const newContact = new Contact({
            name: name.trim(),
            email: email.trim(),
            subject: subject ? subject.trim() : 'General Inquiry',
            message: message.trim(),
            status: 'pending'
        });
        
        // Save to MongoDB
        const savedContact = await newContact.save();
        
        console.log(`📩 New contact message from: ${savedContact.name} (${savedContact.email})`);
        console.log(`📝 Message ID: ${savedContact._id}`);
        
        // Send success response
        res.status(201).json({
            success: true,
            message: 'Message sent successfully!',
            data: {
                id: savedContact._id,
                name: savedContact.name,
                email: savedContact.email,
                subject: savedContact.subject,
                createdAt: savedContact.createdAt
            }
        });
        
    } catch (error) {
        console.error('❌ Contact save error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to send message. Please try again later.',
            error: error.message 
        });
    }
});

// GET /api/contacts - Get all contact messages (for admin dashboard)
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find()
            .sort({ createdAt: -1 }) // Newest first
            .limit(100);
        
        console.log(`📊 Returning ${contacts.length} contact messages`);
        res.json({
            success: true,
            count: contacts.length,
            data: contacts
        });
        
    } catch (error) {
        console.error('❌ Contact fetch error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch messages' 
        });
    }
});

// PUT /api/contacts/:id - Update contact status (for admin)
app.put('/api/contacts/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        const updated = await Contact.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );
        
        if (!updated) {
            return res.status(404).json({ 
                success: false,
                message: 'Contact message not found' 
            });
        }
        
        console.log(`✏️ Updated contact status: ${req.params.id} -> ${status}`);
        res.json({
            success: true,
            message: 'Status updated successfully',
            data: updated
        });
        
    } catch (error) {
        console.error('❌ Contact update error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update message' 
        });
    }
});

// DELETE /api/contacts/:id - Delete contact message
app.delete('/api/contacts/:id', async (req, res) => {
    try {
        const deleted = await Contact.findByIdAndDelete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({ 
                success: false,
                message: 'Contact message not found' 
            });
        }
        
        console.log(`🗑️ Deleted contact message: ${req.params.id}`);
        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Contact delete error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to delete message' 
        });
    }
});

// POST /api/staff/login - Staff login (UPDATED VERSION)
app.post('/api/staff/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();
        
        // Check if Staff model exists
        if (mongoose.models.Staff) {
            // Find staff by email
            const staff = await Staff.findOne({ email: normalizedEmail });
            
            if (!staff) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid credentials' 
                });
            }
            
            // Compare password using bcrypt
            const isPasswordValid = await staff.comparePassword(password);
            
            if (!isPasswordValid) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid credentials' 
                });
            }
            
            // Login successful
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: {
                    id: staff._id,
                    email: staff.email,
                    name: staff.name,
                    role: staff.role
                }
            });
            
        } else {
            // Fallback if Staff model doesn't exist (in-memory fallback)
            const staffUsers = [
                { 
                    email: 'admin@hercycle.com', 
                    password: 'admin123', 
                    name: 'Admin User', 
                    role: 'admin' 
                }
            ];
            
            const match = staffUsers.find(u => u.email === normalizedEmail && u.password === password);
            
            if (!match) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid credentials' 
                });
            }
            
            // Login successful (fallback)
            return res.status(200).json({
                success: true,
                message: 'Login successful (fallback mode)',
                user: {
                    email: match.email,
                    name: match.name,
                    role: match.role
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Staff login error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
});

// POST /api/staff/register - Register new staff (optional, for admin use)
app.post('/api/staff/register', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        
        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email, password, and name are required' 
            });
        }
        
        // Check if email already exists
        const existingStaff = await Staff.findOne({ email: email.toLowerCase().trim() });
        if (existingStaff) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }
        
        // Create new staff
        const newStaff = new Staff({
            email: email.toLowerCase().trim(),
            password: password,
            name: name,
            role: role || 'staff'
        });
        
        await newStaff.save();
        
        res.status(201).json({
            success: true,
            message: 'Staff registered successfully',
            user: {
                id: newStaff._id,
                email: newStaff.email,
                name: newStaff.name,
                role: newStaff.role
            }
        });
        
    } catch (error) {
        console.error('❌ Staff registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Registration failed' 
        });
    }
});

// GET /api/staff - Get all staff (admin only, optional)
app.get('/api/staff', async (req, res) => {
    try {
        const staffList = await Staff.find({}, { password: 0 }); // Exclude passwords
        
        res.json({
            success: true,
            count: staffList.length,
            staff: staffList
        });
        
    } catch (error) {
        console.error('❌ Get staff error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch staff' 
        });
    }
});

// Test endpoint
app.get('/api/test', async (req, res) => {
    try {
        const experienceCount = await Experience.countDocuments();
        const staffCount = await Staff.countDocuments();
        
        res.json({
            success: true,
            message: 'HerCycle API is working!',
            database: 'MongoDB Atlas',
            status: {
                dbConnected: mongoose.connection.readyState === 1,
                experiences: experienceCount,
                staff: staffCount
            },
            endpoints: {
                feedback: {
                    get: 'GET /api/experiences',
                    create: 'POST /api/experiences',
                    update: 'PUT /api/experiences/:id',
                    delete: 'DELETE /api/experiences/:id'
                },
                staff: {
                    login: 'POST /api/staff/login',
                    register: 'POST /api/staff/register',
                    list: 'GET /api/staff'
                }
            }
        });
        
    } catch (error) {
        res.json({
            success: false,
            message: 'API test error',
            error: error.message
        });
    }
});

// Home page
app.get('/', (req, res) => {
    res.json({
        message: 'HerCycle Feedback & Staff API',
        status: 'Running',
        database: mongoose.connection.readyState === 1 ? 'MongoDB Atlas' : 'In-memory',
        testEndpoint: '/api/test',
        version: '1.0.0'
    });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log(`🚀 HERCYCLE SERVER RUNNING ON PORT ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`📊 MongoDB Atlas: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
    console.log('='.repeat(60));
    console.log('\n📋 AVAILABLE ENDPOINTS:');
    console.log('   FEEDBACK API:');
    console.log(`     GET  http://localhost:${PORT}/api/experiences`);
    console.log(`     POST http://localhost:${PORT}/api/experiences`);
    console.log(`     PUT  http://localhost:${PORT}/api/experiences/:id`);
    console.log(`     DEL  http://localhost:${PORT}/api/experiences/:id`);
    console.log('\n   STAFF AUTH API:');
    console.log(`     POST http://localhost:${PORT}/api/staff/login`);
    console.log(`     POST http://localhost:${PORT}/api/staff/register (admin)`);
    console.log(`     GET  http://localhost:${PORT}/api/staff (admin)`);
    console.log('\n   TEST:');
    console.log(`     GET  http://localhost:${PORT}/api/test`);
    console.log('\n✅ Backend is ready! Staff login: admin@hercycle.com / admin123');
});