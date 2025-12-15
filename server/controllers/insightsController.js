const Cycle = require("../models/Cycle");
const DailyLog = require("../models/DailyLog");

exports.getInsights = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Last 6 cycles for pattern insights
    const cycles = await Cycle.find({ userId }).sort({ periodStart: -1 }).limit(6);

    // Last 30 days logs for symptom trends
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);

    const logs = await DailyLog.find({ userId, date: { $gte: fromDate } }).sort({ date: -1 });

    const insights = [];

    // --- Rule 1: Cycle regularity
    if (cycles.length >= 3) {
      const starts = cycles.map((c) => new Date(c.periodStart)).sort((a, b) => a - b);
      const gaps = [];
      for (let i = 1; i < starts.length; i++) {
        const gap = Math.round((starts[i] - starts[i - 1]) / (1000 * 60 * 60 * 24));
        if (gap > 0 && gap < 60) gaps.push(gap);
      }
      if (gaps.length > 0) {
        const maxGap = Math.max(...gaps);
        const minGap = Math.min(...gaps);
        if (maxGap - minGap <= 5) {
          insights.push({
            type: "positive",
            title: "Your cycle looks quite regular",
            detail: "Your recent cycles have been consistent with only small variation.",
          });
        } else {
          insights.push({
            type: "info",
            title: "Your cycle varies a bit",
            detail: "Your recent cycle lengths vary noticeably. Tracking more data will improve predictions.",
          });
        }
      }
    }

    // --- Rule 2: Frequent cramps
    const crampsCount = logs.filter((l) => Array.isArray(l.symptoms) && l.symptoms.includes("cramps")).length;
    if (crampsCount >= 3) {
      insights.push({
        type: "tip",
        title: "Cramps appear frequently",
        detail: "Warm compress, hydration, and gentle stretching may help. If severe or unusual, consider medical advice.",
      });
    }

    // --- Rule 3: High pain levels
    const highPainDays = logs.filter((l) => (l.painLevel || 0) >= 4).length;
    if (highPainDays >= 2) {
      insights.push({
        type: "warning",
        title: "High pain levels detected",
        detail: "You logged high pain levels multiple times. If this continues or affects daily life, consider consulting a professional.",
      });
    }

    // --- Rule 4: Mood trend
    const moodCounts = {};
    logs.forEach((l) => {
      if (l.mood) moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1;
    });
    const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    if (mostCommonMood) {
      insights.push({
        type: "info",
        title: "Mood pattern (last 30 days)",
        detail: `Your most frequent mood logged is: ${mostCommonMood[0]}.`,
      });
    }

    // --- Default message
    if (insights.length === 0) {
      insights.push({
        type: "info",
        title: "No strong patterns yet",
        detail: "Keep logging your cycle and symptoms to unlock more personalized insights.",
      });
    }

    res.json({ insights });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
