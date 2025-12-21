const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test API endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'HerCycle Backend is working!',
        status: 'success'
    });
});

// Add more routes here
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/cycles', require('./routes/cycleRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});