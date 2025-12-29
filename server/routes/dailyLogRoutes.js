const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  upsertDailyLog,
  getDailyLogs,
  deleteDailyLogById,
} = require("../controllers/dailyLogController");

router.post("/", auth, upsertDailyLog); // create or update
router.get("/", auth, getDailyLogs);

// new
router.delete("/:id", auth, deleteDailyLogById);

module.exports = router;
