const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { upsertDailyLog, getDailyLogs } = require("../controllers/dailyLogController");

router.post("/", auth, upsertDailyLog); // create or update
router.get("/", auth, getDailyLogs);

module.exports = router;
