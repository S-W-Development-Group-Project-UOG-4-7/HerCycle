import React, { useMemo } from "react";
import { getCycleSummary } from "../../utils/cycleSummary";

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
        () => getCycleSummary(cycleProfile, cycleTrackers, new Date()),
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
                    <span className="next-value">
                        In {summary.daysUntilNextPeriod} day{summary.daysUntilNextPeriod === 1 ? "" : "s"}
                    </span>
                </div>
            </div>

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
