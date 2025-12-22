
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

console.log("🔧 Environment Check:");
console.log("- PORT:", process.env.PORT);
console.log("- MONGODB_URI exists?", !!process.env.MONGODB_URI);

// MongoDB Connection
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("❌ ERROR: MONGODB_URI is missing in .env");
            console.log("💡 Current .env keys:", Object.keys(process.env).filter(k => k.includes("MONGO")));
            return false;
        }

        console.log("🔄 Connecting to MongoDB...");
        
        // Hide password in logs
        const safeUri = process.env.MONGODB_URI.replace(/:([^:@]+)@/, ":****@");
        console.log("📡 Connection string:", safeUri);
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        
        console.log("✅ MongoDB Connected Successfully!");
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🏠 Host: ${mongoose.connection.host}`);
        
        return true;
    } catch (error) {
        console.error("❌ MongoDB Connection Failed!");
        console.error("Error:", error.message);
        
        // Specific error messages
        if (error.message.includes("Authentication failed")) {
            console.log("💡 Check your username/password in MONGODB_URI");
        } else if (error.message.includes("getaddrinfo ENOTFOUND")) {
            console.log("💡 Check your cluster URL (hercycle.8ijqlb7.mongodb.net)");
        } else if (error.message.includes("bad auth")) {
            console.log("💡 Authentication failed - check credentials");
        }
        
        return false;
    }
};


// Routes
app.get("/", (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = ["disconnected", "connected", "connecting", "disconnecting"];
    const statusText = statusMap[dbStatus] || "unknown";
    
    res.json({
        project: "HerCycle",
        status: "Server is running",
        database: {
            status: statusText,
            connected: dbStatus === 1,
            name: mongoose.connection.name || "Not connected"
        },
        endpoints: {
            home: "/",
            health: "/health",
            databaseInfo: "/database",
            createTestUser: "POST /api/users/test",
            getAllUsers: "GET /api/users"
        }
    });
});

// Health check
app.get("/health", (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    
    res.json({
        status: dbStatus === 1 ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        database: {
            state: dbStatus,
            connected: dbStatus === 1,
            name: mongoose.connection.name
        }
    });
});

// Database info
app.get("/database", async (req, res) => {
    try {
        const collections = mongoose.connection.collections || {};
        const collectionNames = Object.keys(collections);
        
        res.json({
            database: mongoose.connection.name,
            collections: collectionNames,
            totalCollections: collectionNames.length,
            connectionState: mongoose.connection.readyState,
            host: mongoose.connection.host
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server after DB connection and handle port-in-use errors with retries
const PORT = parseInt(process.env.PORT, 10) || 5000;

const startServerWithRetries = (startPort, maxRetries = 3) => {
    let attempts = 0;

    const tryListen = (port) => {
        const server = app.listen(port, () => {
            console.log("========================================");
            console.log("🚀 HerCycle Backend Server");
            console.log("🌐 http://localhost:" + port);
            console.log("🔧 Port: " + port);
            console.log("========================================");
        });

        server.on('error', (err) => {
            if (err && err.code === 'EADDRINUSE') {
                attempts += 1;
                console.error(`❌ Port ${port} in use. Attempt ${attempts} of ${maxRetries}.`);
                if (attempts <= maxRetries) {
                    const nextPort = port + 1;
                    console.log(`🔁 Trying fallback port ${nextPort}...`);
                    tryListen(nextPort);
                } else {
                    console.error('🚨 All retry attempts exhausted. Exiting.');
                    process.exit(1);
                }
            } else {
                console.error('Server error:', err);
                process.exit(1);
            }
        });
    };

    tryListen(startPort);
};

(async () => {
    const connected = await connectDB();
    if (!connected) {
        console.error('❌ Database connection failed. Not starting server.');
        process.exit(1);
    }

    startServerWithRetries(PORT, 5);
})();
