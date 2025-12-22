const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        // Log a friendly message and the mongoose connection state for debugging
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        console.log('✅ MongoDB Connected Successfully');
        console.log(`Mongoose connection state: ${mongoose.connection.readyState} (${states[mongoose.connection.readyState] || 'unknown'})`);
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;