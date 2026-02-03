const express = require("express");
const router = express.Router();

const CycleProfile = require("../models/CycleProfile");
const DailyLog = require("../models/DailyLog");
const CycleTracker = require("../models/CycleTracker");

/**
 * GET /api/cycle/profile/:nic
 */
router.get("/profile/:nic", async (req, res) => {
  try {
    const profile = await CycleProfile.findOne({
      NIC: req.params.nic,
      is_deleted: false,
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Cycle profile not found" });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/cycle/profile   (upsert)
 */
router.post("/profile", async (req, res) => {
  try {
    const { NIC, cycle_length, period_length, tracking_preferences, privacy_settings } = req.body;

    if (!NIC) {
      return res.status(400).json({ success: false, message: "NIC is required" });
    }

    const updated = await CycleProfile.findOneAndUpdate(
      { NIC },
      {
        $set: {
          cycle_length: cycle_length ?? 28,
          period_length: period_length ?? 5,
          tracking_preferences: tracking_preferences ?? {},
          privacy_settings: privacy_settings ?? {},
        },
        $setOnInsert: {
          NIC,
          is_active: true,
          is_anonymized: false,
          is_deleted: false,
          deleted_at: null,
        },
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: "Cycle profile saved", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/cycle/daily-log
 */
router.post("/daily-log", async (req, res) => {
  try {
    const payload = req.body;

    if (!payload?.NIC || !payload?.date) {
      return res.status(400).json({ success: false, message: "NIC and date are required" });
    }

    // normalize date (store as Date)
    const doc = {
      ...payload,
      date: new Date(payload.date),
      is_deleted: false,
      deleted_at: null,
    };

    // Upsert daily log by NIC+date (if already exists, update it)
    const saved = await DailyLog.findOneAndUpdate(
      { NIC: doc.NIC, date: doc.date, is_deleted: false },
      { $set: doc },
      { new: true, upsert: true }
    );

    // Update cycle predictions if flow indicates period start
    const profile = await CycleProfile.findOne({ NIC: doc.NIC, is_deleted: false });
    if (profile && doc.flow && (doc.flow === "medium" || doc.flow === "heavy")) {
      profile.last_period_start = doc.date;
      const next = new Date(doc.date);
      next.setDate(next.getDate() + (profile.cycle_length || 28));
      profile.next_period_predicted = next;
      await profile.save();
    }

    res.json({ success: true, message: "Daily log saved successfully", data: saved });
  } catch (error) {
    // If unique index conflict happens
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A daily log already exists for this date.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/cycle/history/:nic
 */
router.get("/history/:nic", async (req, res) => {
  try {
    const nic = req.params.nic;

    const logs = await DailyLog.find({ NIC: nic, is_deleted: false }).sort({ date: -1 });
    const trackers = await CycleTracker.find({ NIC: nic, is_deleted: false }).sort({
      period_start_date: -1,
    });

    res.json({
      success: true,
      data: {
        daily_logs: logs,
        cycle_trackers: trackers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/cycle/tracker
 */
router.post("/tracker", async (req, res) => {
  try {
    const { NIC, period_start_date, period_end_date, notes } = req.body;

    if (!NIC || !period_start_date) {
      return res.status(400).json({
        success: false,
        message: "NIC and period_start_date are required",
      });
    }

    const tracker = await CycleTracker.create({
      NIC,
      period_start_date: new Date(period_start_date),
      period_end_date: period_end_date ? new Date(period_end_date) : null,
      notes: notes || "",
      is_deleted: false,
      deleted_at: null,
    });

    res.json({ success: true, message: "Cycle tracker saved", data: tracker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * SOFT DELETE: DELETE /api/cycle/daily-log/:id
 */
router.delete("/daily-log/:id", async (req, res) => {
  try {
    const updated = await DailyLog.findOneAndUpdate(
      { _id: req.params.id, is_deleted: false },
      { $set: { is_deleted: true, deleted_at: new Date() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Daily log not found" });
    }

    res.json({ success: true, message: "Daily log deleted (soft)", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * SOFT DELETE: DELETE /api/cycle/tracker/:id
 */
router.delete("/tracker/:id", async (req, res) => {
  try {
    const updated = await CycleTracker.findOneAndUpdate(
      { _id: req.params.id, is_deleted: false },
      { $set: { is_deleted: true, deleted_at: new Date() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Cycle entry not found" });
    }

    res.json({ success: true, message: "Cycle entry deleted (soft)", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
