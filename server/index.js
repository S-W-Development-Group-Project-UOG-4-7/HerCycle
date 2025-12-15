const authRoutes = require("./routes/authRoutes");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cycleRoutes = require("./routes/cycleRoutes");
const dailyLogRoutes = require("./routes/dailyLogRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const insightsRoutes = require("./routes/insightsRoutes");



require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/cycles", cycleRoutes);
app.use("/api/daily-logs", dailyLogRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/insights", insightsRoutes);





// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Test route
app.get("/", (req, res) => {
  res.send("HerCycle backend is running");
});

// Server start
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
