import React, { useMemo } from "react";
import { getCycleSummaryUsingAverage } from "../../utils/cycleSummary";

function toYmd(d) {
    if (!d) return null;
    const x = new Date(d);
    if (isNaN(x.getTime())) return null;

    // LOCAL YYYY-MM-DD (no timezone shifting)
    const yyyy = x.getFullYear();
    const mm = String(x.getMonth() + 1).padStart(2, "0");
    const dd = String(x.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default function CycleOverviewWidget({
    cycleProfile,
    cycleTrackers = [],
    dailyLogs = [],
    onGoToPeriod,
    onGoToDailyLog,
}) {

    const summary = useMemo(
        () => getCycleSummaryUsingAverage(cycleProfile, cycleTrackers, new Date()),
        [cycleProfile, cycleTrackers]
    );


    const todayYmd = toYmd(new Date());
    const hasTodayLog = Array.isArray(dailyLogs)
        ? dailyLogs.some((l) =>
            toYmd(l?.date || l?.log_date || l?.created_at) === todayYmd
        )
        : false;


    if (!summary?.hasData) {
        return (
            <div className="cycle-widget">
                <h2>Cycle Tracking</h2>
                <p style={{ marginTop: 6 }}>
                    No cycle data yet. Please log your period to unlock phase tracking.
                </p>

                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                    <button className="log-day-btn" onClick={onGoToPeriod}>
                        Log your period
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cycle-widget">
            <h2>Cycle Tracking</h2>

            <div className="cycle-status">
                <div className="cycle-phase">
                    <span className="phase-label">Current Phase:</span>
                    <span className="phase-value">{summary.currentPhase}</span>
                </div>

                <div className="cycle-days">
                    <span className="days-label">Cycle Day:</span>
                    <span className="days-value">{summary.currentCycleDay}</span>
                </div>

                <div className="next-period">
                    <span className="next-label">Next Period:</span>
                    {summary.usedAverage && summary.avgCycleLength ? (
                        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                            Based on your average ({summary.avgCycleLength} days)
                        </div>
                    ) : null}
                    <span className="next-value">
                        {summary.daysUntilNextPeriod === null || summary.daysUntilNextPeriod === undefined
                            ? "Not recorded"
                            : summary.daysUntilNextPeriod > 1
                                ? `In ${summary.daysUntilNextPeriod} days`
                                : summary.daysUntilNextPeriod === 1
                                    ? "In 1 day"
                                    : summary.daysUntilNextPeriod === 0
                                        ? "Today"
                                        : `${Math.abs(summary.daysUntilNextPeriod)} days late`}
                    </span>
                </div>
                
            </div>
            {/* Prediction context (only when using average) */}
            {summary.usedAverage ? (
                <div className="cycle-prediction-meta">
                    <div className="cycle-prediction-confidence">
                        Prediction confidence:
                        <span
                            className={`cycle-confidence-pill ${summary.confidence}`}
                        >
                            {summary.confidence}
                        </span>
                        {summary.cycleCount ? `(based on ${summary.cycleCount} cycles)` : ""}
                    </div>

                    {summary.isIrregular ? (
                        <div className="cycle-irregular-warning">
                            ⚠ Your cycle length varies by about{" "}
                            <strong>{summary.variabilityDays}</strong> days (Predictions may be less reliable.)
                        </div>
                    ) : null}
                </div>
            ) : (
                <div className="cycle-prediction-hint">
                    Log at least 2 period starts to enable personalized prediction.
                </div>
            )}
            {!hasTodayLog && (
                <div className="dailylog-warning">
                    <div className="dailylog-warning-title">
                        You still haven’t recorded today’s daily log.
                    </div>

                    <button className="dailylog-warning-btn" onClick={onGoToDailyLog}>
                        Go to Daily Logs
                    </button>
                </div>
            )}


            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <button className="log-day-btn" onClick={onGoToPeriod}>
                    Log your period
                </button>
                <button className="log-day-btn" onClick={onGoToDailyLog}>
                    Record daily log
                </button>
            </div>
        </div>
    );
}
