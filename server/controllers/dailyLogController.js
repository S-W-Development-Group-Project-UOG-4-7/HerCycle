const DailyLog = require("../models/DailyLog");

exports.upsertDailyLog = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date, flow, painLevel, symptoms, mood, sleepHours, energyLevel, notes } = req.body;

    if (!date) return res.status(400).json({ message: "date is required" });

    const doc = await DailyLog.findOneAndUpdate(
      { userId, date: new Date(date) },
      {
        $set: { flow, painLevel, symptoms, mood, sleepHours, energyLevel, notes },
      },
      { new: true, upsert: true }
    );

    res.status(200).json(doc);
  } catch (err) {
    // duplicate key or other
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDailyLogs = async (req, res) => {
  try {
    const userId = req.user.userId;

    // optional: ?from=YYYY-MM-DD&to=YYYY-MM-DD
    const { from, to } = req.query;
    const filter = { userId };

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const logs = await DailyLog.find(filter).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.deleteDailyLogById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const deleted = await DailyLog.findOneAndDelete({ _id: id, userId });
    if (!deleted) return res.status(404).json({ message: "Daily log not found" });

    res.json({ message: "Daily log deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

