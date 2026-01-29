import React, { useEffect, useMemo, useRef, useState } from "react";
import "./DonationOverview.css";

// Charts (Recharts)
// Install if you don't have it:
// npm i recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/**
 * PDF Export (jsPDF + autoTable)
 * Install if you don't have it:
 * npm i jspdf jspdf-autotable
 */
async function exportDonationsPDF({
  title,
  generatedAt,
  summary,
  rows,
  fileName = "donations-report.pdf",
}) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, 40, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated: ${generatedAt}`, 40, 66);

  // Summary cards text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Summary", 40, 92);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const summaryLines = [
    `Total Raised: Rs. ${summary.totalRaised.toLocaleString()}`,
    `Total Donations: ${summary.totalCount.toLocaleString()}`,
    `Average Donation: Rs. ${summary.avgDonation.toLocaleString()}`,
    `Top Campaign: ${summary.topCampaign || "-"}`,
  ];
  summaryLines.forEach((line, i) => doc.text(line, 40, 112 + i * 14));

  // Table
  autoTable(doc, {
    startY: 180,
    head: [["#", "Donor", "Email", "Campaign", "Amount (Rs.)", "Date"]],
    body: rows.map((r, idx) => [
      idx + 1,
      r.donorName,
      r.donorEmail,
      r.campaignName,
      r.amount,
      r.date,
    ]),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [37, 99, 235] }, // blue header
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 100 },
      2: { cellWidth: 120 },
      3: { cellWidth: 90 },
      4: { cellWidth: 72, halign: "right" },
      5: { cellWidth: 110 },
    },
    didDrawPage: () => {
      doc.setFontSize(9);
      doc.text(
        `Page ${doc.internal.getNumberOfPages()}`,
        pageWidth - 60,
        doc.internal.pageSize.getHeight() - 20
      );
    },
  });

  doc.save(fileName);
}

const money = (n) => `Rs. ${(Number(n) || 0).toLocaleString()}`;

function clampDateISO(d) {
  // returns YYYY-MM-DD
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function inRange(dateISO, startISO, endISO) {
  if (!dateISO) return false;
  const t = new Date(dateISO).getTime();
  if (Number.isNaN(t)) return false;
  if (startISO) {
    const s = new Date(`${startISO}T00:00:00`).getTime();
    if (!Number.isNaN(s) && t < s) return false;
  }
  if (endISO) {
    const e = new Date(`${endISO}T23:59:59`).getTime();
    if (!Number.isNaN(e) && t > e) return false;
  }
  return true;
}

const DonationOverview = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [search, setSearch] = useState("");
  const [campaign, setCampaign] = useState("ALL");
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Auto refresh (optional)
  const intervalRef = useRef(null);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Uses your existing endpoint (DB-driven)
      const res = await fetch("http://localhost:5000/api/payment/donations", {
        headers,
      });
      if (!res.ok) throw new Error("Failed to fetch donations");

      const json = await res.json();
      setDonations(Array.isArray(json?.data) ? json.data : []);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Fetch error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();

    // Optional polling (you already do this pattern)
    intervalRef.current = setInterval(fetchDonations, 20000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Campaign options from DB data
  const campaignOptions = useMemo(() => {
    const set = new Set();
    donations.forEach((d) => {
      const name = (d?.campaignName || "General").trim();
      if (name) set.add(name);
    });
    return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [donations]);

  // Filtered list (DB-driven, filtered on client)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const result = donations
      .map((d) => {
        const createdAt = d?.createdAt ? new Date(d.createdAt) : null;
        return {
          raw: d,
          donorName: d?.donorName || "Anonymous",
          donorEmail: d?.donorEmail || "-",
          campaignName: d?.campaignName || "General",
          amount: Number(d?.amount) || 0,
          createdAtISO: createdAt && !Number.isNaN(createdAt) ? createdAt.toISOString() : "",
          createdAtLocal: createdAt && !Number.isNaN(createdAt)
            ? createdAt.toLocaleString()
            : "-",
          createdAtDateISO: createdAt && !Number.isNaN(createdAt) ? clampDateISO(createdAt) : "",
        };
      })
      .filter((x) => {
        if (campaign !== "ALL" && x.campaignName !== campaign) return false;
        if (startDate || endDate) {
          if (!inRange(x.createdAtISO, startDate, endDate)) return false;
        }
        if (!q) return true;
        const hay = `${x.donorName} ${x.donorEmail} ${x.campaignName}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => (b.createdAtISO || "").localeCompare(a.createdAtISO || ""));

    return result;
  }, [donations, search, campaign, startDate, endDate]);

  // Summary
  const summary = useMemo(() => {
    const totalRaised = filtered.reduce((s, d) => s + d.amount, 0);
    const totalCount = filtered.length;
    const avgDonation = totalCount ? Math.round(totalRaised / totalCount) : 0;

    const campaignTotals = new Map();
    filtered.forEach((d) => {
      campaignTotals.set(d.campaignName, (campaignTotals.get(d.campaignName) || 0) + d.amount);
    });

    let topCampaign = "";
    let topCampaignVal = 0;
    for (const [k, v] of campaignTotals.entries()) {
      if (v > topCampaignVal) {
        topCampaignVal = v;
        topCampaign = k;
      }
    }

    return { totalRaised, totalCount, avgDonation, topCampaign };
  }, [filtered]);

  // Charts data
  const topCampaignsData = useMemo(() => {
    const map = new Map();
    filtered.forEach((d) => {
      map.set(d.campaignName, (map.get(d.campaignName) || 0) + d.amount);
    });

    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [filtered]);

  const last30DaysLine = useMemo(() => {
    // build last 30 days keys
    const map = new Map();
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = clampDateISO(d);
      map.set(key, 0);
    }
    filtered.forEach((d) => {
      if (!d.createdAtDateISO) return;
      if (!map.has(d.createdAtDateISO)) return;
      map.set(d.createdAtDateISO, map.get(d.createdAtDateISO) + d.amount);
    });

    return Array.from(map.entries()).map(([date, total]) => ({
      date,
      total,
    }));
  }, [filtered]);

  const campaignsPie = useMemo(() => {
    // pie uses top 5 + "Other"
    const sorted = [...topCampaignsData].sort((a, b) => b.total - a.total);
    const top5 = sorted.slice(0, 5);
    const rest = sorted.slice(5).reduce((s, x) => s + x.total, 0);
    const out = top5.map((x) => ({ name: x.name, value: x.total }));
    if (rest > 0) out.push({ name: "Other", value: rest });
    return out;
  }, [topCampaignsData]);

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(Math.max(page, 1), pageCount);
  const pageItems = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSafe]);

  useEffect(() => {
    setPage(1);
  }, [search, campaign, startDate, endDate]);

  const onDownloadPDF = async () => {
    const rows = filtered.map((d) => ({
      donorName: d.donorName,
      donorEmail: d.donorEmail,
      campaignName: d.campaignName,
      amount: (d.amount || 0).toLocaleString(),
      date: d.createdAtLocal,
    }));

    const filterText = [
      campaign !== "ALL" ? `Campaign: ${campaign}` : null,
      startDate ? `From: ${startDate}` : null,
      endDate ? `To: ${endDate}` : null,
      search.trim() ? `Search: "${search.trim()}"` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    await exportDonationsPDF({
      title: filterText ? `Donations Report (${filterText})` : "Donations Report",
      generatedAt: new Date().toLocaleString(),
      summary,
      rows,
      fileName: "donations-report.pdf",
    });
  };

  return (
    <div className="do2-page">
      <div className="do2-topbar">
        <div>
          <h1 className="do2-title">Donation Overview</h1>
          <p className="do2-subtitle">
            Live donation insights from your database (campaign totals, trends, and exportable reports).
          </p>
        </div>

        <div className="do2-actions">
          <button className="do2-btn do2-btn-ghost" onClick={fetchDonations} disabled={loading}>
            ⟳ Refresh
          </button>
          <button className="do2-btn do2-btn-primary" onClick={onDownloadPDF} disabled={loading || filtered.length === 0}>
            ⬇ Download PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="do2-filters">
        <div className="do2-filter">
          <label>Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Donor name, email, campaign..."
          />
        </div>

        <div className="do2-filter">
          <label>Campaign</label>
          <select value={campaign} onChange={(e) => setCampaign(e.target.value)}>
            {campaignOptions.map((c) => (
              <option key={c} value={c}>
                {c === "ALL" ? "All campaigns" : c}
              </option>
            ))}
          </select>
        </div>

        <div className="do2-filter">
          <label>From</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div className="do2-filter">
          <label>To</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <button
          className="do2-btn do2-btn-soft"
          onClick={() => {
            setSearch("");
            setCampaign("ALL");
            setStartDate("");
            setEndDate("");
          }}
        >
          Clear
        </button>
      </div>

      {/* Summary */}
      <div className="do2-summary">
        <div className="do2-card do2-card-gradient">
          <div className="do2-card-label">Total Raised</div>
          <div className="do2-card-value">{money(summary.totalRaised)}</div>
          <div className="do2-card-sub">Filtered donations only</div>
        </div>

        <div className="do2-card">
          <div className="do2-card-label">Total Donations</div>
          <div className="do2-card-value">{summary.totalCount.toLocaleString()}</div>
          <div className="do2-card-sub">Matching your filters</div>
        </div>

        <div className="do2-card">
          <div className="do2-card-label">Average Donation</div>
          <div className="do2-card-value">{money(summary.avgDonation)}</div>
          <div className="do2-card-sub">Per donation</div>
        </div>

        <div className="do2-card">
          <div className="do2-card-label">Top Campaign</div>
          <div className="do2-card-value do2-card-value-sm">{summary.topCampaign || "-"}</div>
          <div className="do2-card-sub">Highest total raised</div>
        </div>
      </div>

      {/* Body */}
      <div className="do2-grid">
        {/* Left: charts */}
        <div className="do2-col">
          <div className="do2-panel">
            <div className="do2-panel-head">
              <h3>Top Campaigns</h3>
              <p>Bar chart from database-driven donations</p>
            </div>

            <div className="do2-chart">
              {loading ? (
                <div className="do2-skeleton" />
              ) : topCampaignsData.length === 0 ? (
                <div className="do2-empty">No data for current filters.</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topCampaignsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip formatter={(v) => money(v)} />
                    <Bar dataKey="total" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="do2-panel">
            <div className="do2-panel-head">
              <h3>Last 30 Days Trend</h3>
              <p>Daily totals (line chart)</p>
            </div>

            <div className="do2-chart">
              {loading ? (
                <div className="do2-skeleton" />
              ) : last30DaysLine.every((x) => x.total === 0) ? (
                <div className="do2-empty">No donations in the last 30 days (for current filters).</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={last30DaysLine}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
                    <YAxis />
                    <Tooltip formatter={(v) => money(v)} />
                    <Line type="monotone" dataKey="total" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Right: list + pie */}
        <div className="do2-col">
          <div className="do2-panel">
            <div className="do2-panel-head">
              <h3>Campaign Share</h3>
              <p>Pie based on filtered donations</p>
            </div>

            <div className="do2-chart do2-chart-pie">
              {loading ? (
                <div className="do2-skeleton" />
              ) : campaignsPie.length === 0 ? (
                <div className="do2-empty">No data for current filters.</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={campaignsPie}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      {campaignsPie.map((_, idx) => (
                        <Cell key={idx} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => money(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="do2-panel">
            <div className="do2-panel-head do2-panel-head-row">
              <div>
                <h3>Donation List</h3>
                <p>
                  Showing <b>{pageItems.length}</b> of <b>{filtered.length}</b>
                </p>
              </div>

              <div className="do2-pager">
                <button
                  className="do2-btn do2-btn-ghost"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pageSafe <= 1}
                >
                  ←
                </button>
                <span className="do2-page-ind">
                  Page {pageSafe} / {pageCount}
                </span>
                <button
                  className="do2-btn do2-btn-ghost"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={pageSafe >= pageCount}
                >
                  →
                </button>
              </div>
            </div>

            {loading ? (
              <div className="do2-loading">Loading donations…</div>
            ) : error ? (
              <div className="do2-error">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="do2-empty">No donations match your filters.</div>
            ) : (
              <div className="do2-table-wrap">
                <table className="do2-table">
                  <thead>
                    <tr>
                      <th>Donor</th>
                      <th>Campaign</th>
                      <th className="do2-right">Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((d, idx) => (
                      <tr key={`${d.createdAtISO}-${idx}`}>
                        <td>
                          <div className="do2-donor">
                            <div className="do2-avatar">
                              {(d.donorName || "A").slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <div className="do2-donor-name">{d.donorName}</div>
                              <div className="do2-donor-email">{d.donorEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="do2-pill">{d.campaignName}</span>
                        </td>
                        <td className="do2-right do2-amount">{money(d.amount)}</td>
                        <td className="do2-date">{d.createdAtLocal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="do2-footnote">
              Tip: PDF export includes all donations that match the current filters (not just this page).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationOverview;
