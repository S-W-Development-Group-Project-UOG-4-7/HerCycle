import React, { useMemo } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ReferenceArea,
    ReferenceLine,
} from "recharts";


function toMidnight(d) {
    const x = new Date(d);
    if (Number.isNaN(x.getTime())) return null;
    x.setHours(0, 0, 0, 0);
    return x;
}

function formatDateShort(value) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}`; // short, easy to read
}
function getStats(values) {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    return { avg, min, max, count: values.length };
}

export default function CycleHealthInsightsTab({ cycleTrackers = [] }) {
    const data = useMemo(() => {
        const starts = (Array.isArray(cycleTrackers) ? cycleTrackers : [])
            .map((t) => t?.period_start_date)
            .filter(Boolean)
            .map(toMidnight)
            .filter(Boolean)
            .sort((a, b) => a - b);

        if (starts.length < 2) return [];

        const points = [];
        for (let i = 1; i < starts.length; i++) {
            const prev = starts[i - 1];
            const curr = starts[i];
            const diffDays = Math.round((curr - prev) / 86400000);

            if (diffDays > 0 && diffDays <= 120) {
                points.push({
                    x: curr.getTime(),            // numeric x => better axis spacing
                    cycleStartISO: curr.toISOString(),
                    cycleStartLabel: formatDateShort(curr),
                    cycleLength: diffDays,
                });
            }
        }
        return points;
    }, [cycleTrackers]);

    const stats = useMemo(() => {
        const lengths = data.map((p) => p.cycleLength);
        return getStats(lengths);
    }, [data]);



    return (
        <div style={{ marginTop: 16 }}>
            {data.length === 0 ? (
                <div className="chart-placeholder">
                    <p>Add at least 2 period start dates to see cycle length variation.</p>
                </div>
            ) : (
                <div className="cycle-insights-card">
                    <div className="cycle-insights-header">
                        <div>
                            <h3 className="cycle-insights-title">Cycle length variation</h3>
                            <p className="cycle-insights-sub">
                                Each point = days between two period start dates.
                            </p>
                        </div>

                        {stats && (
                            <div className="cycle-insights-metrics">
                                <div className="metric">
                                    <div className="metric-label">Avg</div>
                                    <div className="metric-value">{Math.round(stats.avg)} days</div>
                                </div>
                                <div className="metric">
                                    <div className="metric-label">Min</div>
                                    <div className="metric-value">{stats.min} days</div>
                                </div>
                                <div className="metric">
                                    <div className="metric-label">Max</div>
                                    <div className="metric-value">{stats.max} days</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="cycle-chart-wrap">
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart
                                data={data}
                                margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />

                                {/* Typical range shading */}
                                <ReferenceArea y1={21} y2={35} />

                                {/* Average reference line */}
                                {stats && (
                                    <ReferenceLine
                                        y={stats.avg}
                                        strokeDasharray="6 6"
                                        label={{
                                            value: `Avg ${Math.round(stats.avg)}d`,
                                            position: "insideTopRight",
                                        }}
                                    />
                                )}

                                <XAxis
                                    dataKey="x"
                                    type="number"
                                    domain={["dataMin", "dataMax"]}
                                    tickFormatter={(v) => formatDateShort(v)}
                                    tickMargin={10}
                                />

                                <YAxis
                                    allowDecimals={false}
                                    domain={[15, 60]}
                                    tickMargin={10}
                                    label={{ value: "Days", angle: -90, position: "insideLeft" }}
                                />

                                <Tooltip
                                    labelFormatter={(x) => `Cycle start: ${formatDateShort(x)}`}
                                    formatter={(value) => [`${value} days`, "Cycle length"]}
                                />

                                <Legend />

                                <Line
                                    name="Cycle length"
                                    type="monotone"
                                    dataKey="cycleLength"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="cycle-insights-footer">
                        <span className="pill">Typical range: 21–35 days</span>
                        <span className="pill">Points shown: {stats ? stats.count : 0}</span>
                    </div>
                </div>
            )}
        </div>
    );

}
