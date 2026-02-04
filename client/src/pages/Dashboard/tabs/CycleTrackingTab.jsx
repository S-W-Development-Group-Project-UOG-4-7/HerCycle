import React, { useEffect, useState } from "react";
import DailyLogForm from "../../../components/cycle/DailyLogForm";
import HistoryPanel from "../../../components/cycle/HistoryPanel";
import InsightsPanel from "../../../components/cycle/InsightsPanel";
import CycleTrackingForm from "../../../components/cycle/CycleTrackingForm";
import {
    getCycleHistory,
    saveDailyLog,
    deleteDailyLog,
    deleteCycleTracker,
} from "../../../services/cycleApi";
import { getCycleSummaryUsingAverage } from "../../../utils/cycleSummary";

const CycleTrackingTab = ({
    user,
    cycleProfile,
    periodFormRef,
    dailyLogRef,
    dailyLogs,
    setDailyLogs,
    cycleTrackers,
    setCycleTrackers,
}) => {
    const [saving, setSaving] = useState(false);
    // ✅ Summary for average-based cycle length + next period (if available)
    const summary = getCycleSummaryUsingAverage(cycleProfile, cycleTrackers, new Date());

    // ✅ Find last period start (latest tracker date OR profile fallback)
    const lastStart = (() => {
        const trackerStarts = (Array.isArray(cycleTrackers) ? cycleTrackers : [])
            .map((t) => t?.period_start_date)
            .filter(Boolean)
            .map((d) => new Date(d))
            .filter((d) => !Number.isNaN(d.getTime()))
            .sort((a, b) => b - a); // latest first

        const profileStartRaw =
            cycleProfile?.last_period_start ?? cycleProfile?.lastPeriodStart;
        const profileStart = profileStartRaw ? new Date(profileStartRaw) : null;

        return trackerStarts[0] ||
            (profileStart && !Number.isNaN(profileStart.getTime()) ? profileStart : null);
    })();

    // ✅ Display strings (no fake values)
    const cycleLengthText =
        summary?.usedAverage && summary?.avgCycleLength
            ? `${summary.avgCycleLength} days (avg)`
            : `${Number(cycleProfile?.cycle_length ?? 28) || 28} days`;

    const periodLengthText = `${Number(cycleProfile?.period_length ?? 5) || 5} days`;

    const lastPeriodText = lastStart
        ? lastStart.toLocaleDateString()
        : "Not recorded";

    useEffect(() => {
        if (!user?.NIC) return;
        (async () => {
            try {
                const history = await getCycleHistory(user.NIC);
                setDailyLogs(history?.daily_logs || []);
                setCycleTrackers(history?.cycle_trackers || []);
            } catch (e) {
                console.error("Error fetching cycle history:", e);
            }
        })();
    }, [user?.NIC, setDailyLogs, setCycleTrackers]);

    const refreshHistory = async () => {
        if (!user?.NIC) return;
        const history = await getCycleHistory(user.NIC);
        setDailyLogs(history?.daily_logs || []);
        setCycleTrackers(history?.cycle_trackers || []);
    };

    const handleSaveDailyLog = async (formData) => {
        setSaving(true);
        try {
            await saveDailyLog({
                NIC: user.NIC, // ✅ IMPORTANT: backend expects "NIC" not "nic"
                ...formData,
            });

            await refreshHistory();
            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err?.message || "Failed to save daily log.",
            };
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteDailyLog = async (logId) => {
        await deleteDailyLog(logId);
        await refreshHistory();
    };

    const handleDeleteCycleTracker = async (trackerId) => {
        await deleteCycleTracker(trackerId);
        await refreshHistory();
    };

    return (
        <div className="cycle-tracking-tab">
            <h2>Track Your Cycle</h2>

            <div className="cycle-overview">
                <div className="cycle-stats">
                    <div className="cycle-stat">
                        <span className="stat-label">Cycle Length</span>
                        <span className="stat-value">{cycleLengthText}</span>
                    </div>

                    <div className="cycle-stat">
                        <span className="stat-label">Period Length</span>
                        <span className="stat-value">{periodLengthText}</span>
                    </div>

                    <div className="cycle-stat">
                        <span className="stat-label">Last Period</span>
                        <span className="stat-value">{lastPeriodText}</span>
                    </div>
                </div>
            </div>


            <div ref={periodFormRef}>
                <CycleTrackingForm nic={user?.NIC} onSaved={refreshHistory} />
            </div>

            <div ref={dailyLogRef}>
                <DailyLogForm
                    initialDate={new Date().toLocaleDateString("en-CA")}
                    onSave={handleSaveDailyLog}
                    saving={saving}
                />
            </div>

            <HistoryPanel
                dailyLogs={dailyLogs}
                cycleTrackers={cycleTrackers}
                usePopupMessages={true}
                onDeleteDailyLog={handleDeleteDailyLog}
                onDeleteCycleTracker={handleDeleteCycleTracker}
            />

            <InsightsPanel cycleProfile={cycleProfile} dailyLogs={dailyLogs} />
        </div>
    );
};

export default CycleTrackingTab;
