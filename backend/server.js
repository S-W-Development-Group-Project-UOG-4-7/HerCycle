const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const contactRouter = require('./routes/contact');
const experiencesRouter = require('./routes/experiences');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// simple logger
app.use((req, res, next) => {
	console.log(new Date().toISOString(), req.method, req.url);
	next();
});

// API Routes
app.use('/api/experiences', require('./routes/experiences'));
app.use('/api/contacts', require('./routes/contact'));

// MongoDB Connection - Use YOUR actual URI
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://hercycle806_db_user:GphmSbT0gGznlqxB@hercycle.8ijqlb7.mongodb.net/SEO?retryWrites=true&w=majority&appName=HERCYCLE';

mongoose.connect(mongoUri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('✅ MongoDB connected to HERCYCLE database'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working!',
        dbConnected: mongoose.connection.readyState === 1,
        endpoints: {
            experiences: '/api/experiences',
            contacts: '/api/contacts',
            test: '/api/test'
        }
    });
});

// serve frontend build if present (optional)
const frontBuild = path.join(__dirname, '..', 'frontend', 'build');
if (require('fs').existsSync(frontBuild)) {
    app.use(express.static(frontBuild));
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontBuild, 'index.html'), err => {
            if (err) res.status(500).send(err);
        });
    });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Test API: http://localhost:${PORT}/api/test`);
});