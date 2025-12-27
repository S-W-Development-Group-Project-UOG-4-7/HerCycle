
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Enable CORS for frontend
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json());

// Mount contact routes
const contactRoutes = require('./routes/contact');
app.use('/api/contacts', contactRoutes);

console.log("🚀 Starting HerCycle Backend...");

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("✅ MongoDB Connected!");
    console.log(`📊 Database: ${mongoose.connection.name}`);
})
.catch((error) => {
    console.error("❌ MongoDB Connection Error:", error.message);
});

// ==================== FEEDBACK MODEL ====================
const feedbackSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    experience: { type: String, required: true },
    category: { type: String, default: "general" },
    isApproved: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

// ==================== ROUTES ====================

// 1. Home route
app.get("/", (req, res) => {
    res.json({
        message: "HerCycle Backend API",
        status: "running",
        database: mongoose.connection.name,
        endpoints: {
            home: "GET /",
            health: "GET /health",
            collections: "GET /collections",
            getFeedback: "GET /api/feedback",
            submitFeedback: "POST /api/feedback",
            feedbackStats: "GET /api/feedback/stats",
            createSample: "GET /api/feedback/create-sample"
        }
    });
});

// 2. Health check
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: {
            state: mongoose.connection.readyState,
            connected: mongoose.connection.readyState === 1,
            name: mongoose.connection.name
        }
    });
});

// 3. List collections
app.get("/collections", async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);
        
        res.json({
            database: mongoose.connection.name,
            collections: collectionNames,
            count: collectionNames.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== FEEDBACK API ====================

// 4. Get all feedback
app.get("/api/feedback", async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ isApproved: true })
            .sort({ createdAt: -1 })
            .limit(20);
        
        res.json({
            success: true,
            count: feedbacks.length,
            feedbacks: feedbacks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching feedback",
            error: error.message
        });
    }
});

// 5. Submit new feedback
app.post("/api/feedback", async (req, res) => {
    try {
        const { userName, userEmail, rating, experience, category } = req.body;
        
        // Validation
        if (!userName || !userEmail || !rating || !experience) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }
        
        const feedback = new Feedback({
            userName,
            userEmail,
            rating,
            experience,
            category: category || "general"
        });
        
        await feedback.save();
        
        res.status(201).json({
            success: true,
            message: "✅ Thank you for sharing your experience!",
            feedback: {
                id: feedback._id,
                userName: feedback.userName,
                rating: feedback.rating,
                experience: feedback.experience,
                createdAt: feedback.createdAt
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error submitting feedback",
            error: error.message
        });
    }
});

// 6. Get feedback statistics
app.get("/api/feedback/stats", async (req, res) => {
    try {
        const stats = await Feedback.aggregate([
            { $match: { isApproved: true } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalFeedbacks: { $sum: 1 },
                    happyUsers: { $sum: { $cond: [{ $gte: ["$rating", 4] }, 1, 0] } }
                }
            }
        ]);
        
        const result = stats[0] || {
            averageRating: 0,
            totalFeedbacks: 0,
            happyUsers: 0
        };
        
        res.json({
            success: true,
            stats: {
                averageRating: result.averageRating.toFixed(1),
                totalFeedbacks: result.totalFeedbacks,
                happyUsers: result.happyUsers,
                wouldRecommend: Math.round((result.happyUsers / Math.max(result.totalFeedbacks, 1)) * 98)
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching statistics",
            error: error.message
        });
    }
});

// 7. Create sample feedback data
app.get("/api/feedback/create-sample", async (req, res) => {
    try {
        const sampleFeedbacks = [
            {
                userName: "Priya Sharma",
                userEmail: "priya@example.com",
                rating: 5,
                experience: "HerCycle has completely transformed my menstrual health journey. The products are eco-friendly and effective!",
                category: "product",
                isApproved: true
            },
            {
                userName: "Anjali Patel",
                userEmail: "anjali@example.com",
                rating: 5,
                experience: "The educational content is so helpful. As a mother, I appreciate having reliable information to share with my daughter.",
                category: "app",
                isApproved: true
            },
            {
                userName: "Rohit Kumar",
                userEmail: "rohit@example.com",
                rating: 4,
                experience: "Bought products for my sister. She loves them and the delivery was super fast. Great service!",
                category: "service",
                isApproved: true
            },
            {
                userName: "Sneha Reddy",
                userEmail: "sneha@example.com",
                rating: 5,
                experience: "The menstrual cup changed my life! Sustainable, comfortable, and cost-effective in the long run.",
                category: "product",
                isApproved: true
            },
            {
                userName: "Meera Iyer",
                userEmail: "meera@example.com",
                rating: 4,
                experience: "App is user-friendly and the community support is amazing. Would recommend to every woman!",
                category: "app",
                isApproved: true
            }
        ];
        
        // Clear existing and insert new
        await Feedback.deleteMany({});
        await Feedback.insertMany(sampleFeedbacks);
        
        res.json({
            success: true,
            message: "✅ Sample feedback data created!",
            count: sampleFeedbacks.length
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating sample data",
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("========================================");
    console.log("🚀 HerCycle Backend Server Started");
    console.log("🌐 http://localhost:" + PORT);
    console.log("========================================");
    console.log("📝 Available Endpoints:");
    console.log("   GET  /api/feedback");
    console.log("   POST /api/feedback");
    console.log("   GET  /api/feedback/stats");
    console.log("   GET  /api/feedback/create-sample");
});