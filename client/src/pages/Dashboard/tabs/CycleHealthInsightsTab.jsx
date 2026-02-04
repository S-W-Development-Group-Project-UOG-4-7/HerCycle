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
import { getCycleSummaryUsingAverage } from "../../../utils/cycleSummary";
import CycleSexualInsightsCard from "../../../components/cycle/CycleSexualInsightsCard";

function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
}

function gauss(x, mu, sigma) {
    const z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z);
}

// returns 0..100 values across cycle days 1..cycleLen
function buildHormoneSeries(cycleLen = 28) {
    const len = clamp(Number(cycleLen) || 28, 20, 60);
    const ov = clamp(len - 14, 1, len); // estimated ovulation day

    const days = Array.from({ length: len }, (_, i) => i + 1);

    return days.map((day) => {
        // Estrogen: rises in follicular, peaks pre-ovulation, smaller luteal bump
        const e2 = 0.15
            + 0.75 * gauss(day, ov - 1, 3.2)
            + 0.25 * gauss(day, ov + 7, 5.0);

        // LH: sharp surge around ovulation
        const lh = 0.05 + 1.1 * gauss(day, ov, 0.9);

        // FSH: smaller bump around ovulation + early follicular
        const fsh = 0.08 + 0.35 * gauss(day, 2, 2.5) + 0.45 * gauss(day, ov, 1.4);

        // Progesterone: rises after ovulation, peaks mid-luteal, then falls
        const p4 = 0.05 + 1.05 * gauss(day, ov + 7, 4.0);

        // normalize-ish to 0..100
        const toPct = (v, max) => Math.round(clamp((v / max) * 100, 0, 100));

        return {
            day,
            Estrogen: toPct(e2, 1.05),
            Progesterone: toPct(p4, 1.10),
            LH: toPct(lh, 1.15),
            FSH: toPct(fsh, 0.90),
        };
    });
}



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

export default function CycleHealthInsightsTab({ cycleProfile, cycleTrackers = [] }) {
    const summary = useMemo(
        () => getCycleSummaryUsingAverage(cycleProfile, cycleTrackers, new Date()),
        [cycleProfile, cycleTrackers]
    );

    const hormoneData = useMemo(() => {
        const cycleLen =
            summary?.avgCycleLength ||
            Number(cycleProfile?.cycle_length ?? cycleProfile?.cycleLength ?? 28) ||
            28;

        return buildHormoneSeries(cycleLen);
    }, [summary, cycleProfile]);


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
    const quality = useMemo(() => {
        const lengths = data.map((p) => p.cycleLength);
        if (!lengths.length) return null;

        const min = Math.min(...lengths);
        const max = Math.max(...lengths);
        const variabilityDays = max - min;
        const isIrregular = variabilityDays > 7;

        let confidence = "low";
        if (lengths.length >= 6) confidence = "high";
        else if (lengths.length >= 3) confidence = "medium";

        return { confidence, variabilityDays, isIrregular, cycleCount: lengths.length };
    }, [data]);



    return (
        <div style={{ marginTop: 16 }}>
            <CycleSexualInsightsCard summary={summary} />
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

                            {quality ? (
                                <div className="cycle-prediction-meta" style={{ marginTop: 6 }}>
                                    <div className="cycle-prediction-confidence">
                                        Confidence:
                                        <span className={`cycle-confidence-pill ${quality.confidence}`}>
                                            {quality.confidence}
                                        </span>
                                        (based on {quality.cycleCount} cycles)
                                    </div>

                                    {quality.isIrregular ? (
                                        <div className="cycle-irregular-warning">
                                            ⚠ Cycle length variability detected (~{quality.variabilityDays} days).
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

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
                                <CartesianGrid strokeDasharray="2 6" opacity={0.5} />

                                {/* Typical range shading */}
                                <ReferenceArea y1={21} y2={35} fillOpacity={0.08} />
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
            <div className="cycle-insights-card" style={{ marginTop: 12 }}>
                <div className="cycle-insights-header">
                    <div>
                        <h3 className="cycle-insights-title">Hormone Pattern (Estimated)</h3>
                        <p className="cycle-insights-sub">
                            Relative hormone level index (0–100).
                            Shows how hormone levels typically rise and fall across the cycle.
                            <strong> Not lab values.</strong>
                        </p>

                    </div>
                </div>

                <div className="cycle-chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={hormoneData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" tickLine={false} />
                            <YAxis domain={[0, 100]} tickLine={false} />
                            <Tooltip
                                formatter={(value, name) => {
                                    let label = "Low";
                                    if (value >= 70) label = "High";
                                    else if (value >= 35) label = "Moderate";
                                    return [`${label} (${value}/100)`, name];
                                }}
                                labelFormatter={(label) => `Cycle Day ${label}`}
                                contentStyle={{
                                    borderRadius: 10,
                                    border: "none",
                                    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                                }}
                            />


                            <Legend
                                verticalAlign="top"
                                height={36}
                                iconType="circle"
                            />

                            <Line
                                type="monotone"
                                dataKey="Estrogen"
                                stroke="#e85d75"
                                strokeWidth={3}
                                dot={false}
                            />

                            <Line
                                type="monotone"
                                dataKey="Progesterone"
                                stroke="#8b6cff"
                                strokeWidth={3}
                                dot={false}
                            />

                            <Line
                                type="monotone"
                                dataKey="LH"
                                stroke="#2bb673"
                                strokeWidth={2.5}
                                dot={false}
                            />

                            <Line
                                type="monotone"
                                dataKey="FSH"
                                stroke="#5aa9e6"
                                strokeWidth={2.5}
                                dot={false}
                            />

                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <p className="cycle-insights-sub">
                    X-axis shows <strong>cycle day</strong> (Day 1 = first day of your period).
                </p>
            </div>
        </div>
    );
}
