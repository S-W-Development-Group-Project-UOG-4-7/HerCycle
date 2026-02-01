import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./DonationOverview.css";

// Charts
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

// Icons (you can use react-icons or SVG)
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const MoneyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 110 7H6"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

// PDF Export function (unchanged)
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
    headStyles: { fillColor: [37, 99, 235] },
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
  const navigate = useNavigate();

  // Chart colors
  const CHART_COLORS = [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [search, setSearch] = useState("");
  const [campaign, setCampaign] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const intervalRef = useRef(null);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch("http://localhost:5000/api/payment/donations", {
        headers,
      });
      if (res.status === 401 || res.status === 403) {
        // Unauthorized - redirect to login
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch donations");

      const json = await res.json();
      // support both { data: [...] } and { donations: [...] }
      const list = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.donations)
        ? json.donations
        : [];
      setDonations(list);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();

    intervalRef.current = setInterval(fetchDonations, 20000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const campaignOptions = useMemo(() => {
    const set = new Set();
    donations.forEach((d) => {
      const name = (d?.campaignName || "General").trim();
      if (name) set.add(name);
    });
    return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [donations]);

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
      date: date.slice(5), // Show only MM-DD
      total,
    }));
  }, [filtered]);

  const campaignsPie = useMemo(() => {
    const sorted = [...topCampaignsData].sort((a, b) => b.total - a.total);
    const top5 = sorted.slice(0, 5);
    const rest = sorted.slice(5).reduce((s, x) => s + x.total, 0);
    const out = top5.map((x) => ({ name: x.name, value: x.total }));
    if (rest > 0) out.push({ name: "Other", value: rest });
    return out;
  }, [topCampaignsData]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(Math.max(page, 1), pageCount);
  const pageItems = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSafe]);

  useEffect(() => {
    setPage(1);
  }, [search, campaign, startDate, endDate]);

  // Modified: safer PDF download with clear error handling
  const onDownloadPDF = async () => {
    try {
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

      // optional user feedback on success
      // (you can replace with a nicer UI notification)
      // eslint-disable-next-line no-alert
      alert('PDF exported successfully.');
    } catch (err) {
      console.error('PDF export failed:', err);
      // eslint-disable-next-line no-alert
      alert(
        `Export failed: ${err?.message || err}. Ensure jspdf and jspdf-autotable are installed and backend is reachable.`
      );
    }
  };

  // Modified: clearer reset that also resets pagination and refetches
  const handleClearFilters = () => {
    setSearch("");
    setCampaign("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
    // refresh data so UI updates immediately
    fetchDonations();
  };

  return (
    <div className="do2-page">
      {/* Animated Background Elements */}
      <div className="do2-bg-circle"></div>
      <div className="do2-bg-circle"></div>

      {/* REPLACED: removed left navigation bar to simplify layout and center content */}

      {/* Centered Header (new) */}
      <div className="do2-topbar-centered">
        <div style={{ textAlign: 'center', maxWidth: 980, margin: '0 auto' }}>
          <h1 className="do2-title do2-title-highlight">Donation Overview</h1>
          <p className="do2-subtitle" style={{ marginTop: 8 }}>
            Real-time insights from your donation database. Track campaigns, analyze trends, and export reports.
            {filtered.length > 0 && ` Currently showing ${filtered.length.toLocaleString()} donations.`}
          </p>

          <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
            <button
              className="do2-btn do2-btn-ghost"
              onClick={() => navigate('/web-manager-dashboard')}
              title="Return to Dashboard"
              type="button"
            >
              ← Return to Dashboard
            </button>

            <button
              className="do2-btn do2-btn-ghost"
              onClick={fetchDonations}
              disabled={loading}
              type="button"
            >
              <RefreshIcon />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>

            <button
              className="do2-btn do2-btn-primary"
              onClick={onDownloadPDF}
              disabled={loading || filtered.length === 0}
              type="button"
            >
              <DownloadIcon />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="do2-filters">
        <div className="do2-filter">
          <label><FilterIcon /> Search Donations</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type donor name, email, or campaign..."
          />
        </div>

        <div className="do2-filter">
          <label>🏷️ Campaign Filter</label>
          <select value={campaign} onChange={(e) => setCampaign(e.target.value)}>
            {campaignOptions.map((c) => (
              <option key={c} value={c}>
                {c === "ALL" ? "📋 All Campaigns" : `🎯 ${c}`}
              </option>
            ))}
          </select>
        </div>

        <div className="do2-filter">
          <label><CalendarIcon /> Start Date</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
          />
        </div>

        <div className="do2-filter">
          <label><CalendarIcon /> End Date</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
          />
        </div>

        <button
          className="do2-btn do2-btn-soft"
          onClick={handleClearFilters}
          style={{ minWidth: '100px' }}
          type="button"
        >
          🗑️ Clear All
        </button>
      </div>

      {/* Summary Cards */}
      <div className="do2-summary">
        <div className="do2-card do2-card-gradient">
          <div className="do2-card-label">
            <MoneyIcon /> Total Raised
          </div>
          <div className="do2-card-value">{money(summary.totalRaised)}</div>
          <div className="do2-card-sub">
            {summary.totalCount > 0 
              ? `From ${summary.totalCount} donation${summary.totalCount !== 1 ? 's' : ''}`
              : 'No donations yet'
            }
          </div>
        </div>

        <div className="do2-card">
          <div className="do2-card-label">
            <UsersIcon /> Total Donations
          </div>
          <div className="do2-card-value">{summary.totalCount.toLocaleString()}</div>
          <div className="do2-card-sub">Matching current filters</div>
        </div>

        <div className="do2-card">
          <div className="do2-card-label">💰 Average Donation</div>
          <div className="do2-card-value">{money(summary.avgDonation)}</div>
          <div className="do2-card-sub">Per transaction</div>
        </div>

        <div className="do2-card">
          <div className="do2-card-label">🏆 Top Campaign</div>
          <div className="do2-card-value do2-card-value-sm">
            {summary.topCampaign || "No data"}
          </div>
          <div className="do2-card-sub">Highest fundraising total</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="do2-grid">
        {/* Left Column: Charts */}
        <div className="do2-col">
          {/* Top Campaigns Bar Chart */}
          <div className="do2-panel">
            <div className="do2-panel-head">
              <h3>📊 Top Campaigns Performance</h3>
              <p>Revenue distribution across different campaigns</p>
            </div>

            <div className="do2-chart">
              {loading ? (
                <div className="do2-skeleton" />
              ) : topCampaignsData.length === 0 ? (
                <div className="do2-empty">
                  <p>No campaign data available with current filters.</p>
                  <button 
                    className="do2-btn do2-btn-ghost" 
                    onClick={handleClearFilters}
                    style={{ marginTop: '12px' }}
                  >
                    Clear filters to see all data
                  </button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topCampaignsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `Rs. ${(value/1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Amount']}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="total" 
                      radius={[8, 8, 0, 0]}
                      fill="#3B82F6"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* 30-Day Trend Line Chart */}
          <div className="do2-panel">
            <div className="do2-panel-head">
              <h3>📈 Last 30 Days Trend</h3>
              <p>Daily donation amounts over time</p>
            </div>

            <div className="do2-chart">
              {loading ? (
                <div className="do2-skeleton" />
              ) : last30DaysLine.every((x) => x.total === 0) ? (
                <div className="do2-empty">
                  No donations recorded in the last 30 days.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={last30DaysLine}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      minTickGap={24}
                    />
                    <YAxis 
                      tickFormatter={(value) => `Rs. ${(value/1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Amount']}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      dot={{ stroke: '#8B5CF6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pie Chart & Table */}
        <div className="do2-col">
          {/* Campaign Share Pie Chart */}
          <div className="do2-panel">
            <div className="do2-panel-head">
              <h3>🥧 Campaign Share Distribution</h3>
              <p>Percentage breakdown of total donations</p>
            </div>

            <div className="do2-chart do2-chart-pie">
              {loading ? (
                <div className="do2-skeleton" />
              ) : campaignsPie.length === 0 ? (
                <div className="do2-empty">No campaign data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={campaignsPie}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      innerRadius={60}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {campaignsPie.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Amount']}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.1)'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Donation List Table */}
          <div className="do2-panel">
            <div className="do2-panel-head do2-panel-head-row">
              <div>
                <h3>📋 Donation List</h3>
                <p>
                  Showing <b>{pageItems.length}</b> of <b>{filtered.length.toLocaleString()}</b> donations
                  {campaign !== 'ALL' && ` in "${campaign}"`}
                </p>
              </div>

              <div className="do2-pager">
                <button
                  className="do2-btn do2-btn-ghost"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pageSafe <= 1}
                  title="Previous page"
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
                  title="Next page"
                >
                  →
                </button>
              </div>
            </div>

            {loading ? (
              <div className="do2-loading">
                <div className="do2-skeleton" style={{ height: '200px', margin: '16px' }} />
              </div>
            ) : error ? (
              <div className="do2-error">
                <strong>Error loading donations:</strong> {error}
                <button 
                  className="do2-btn do2-btn-ghost" 
                  onClick={fetchDonations}
                  style={{ marginTop: '12px' }}
                >
                  Try Again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="do2-empty">
                <p>No donations match your current filters.</p>
                <button 
                  className="do2-btn do2-btn-ghost" 
                  onClick={handleClearFilters}
                  style={{ marginTop: '12px' }}
                >
                  Clear all filters to see all donations
                </button>
              </div>
            ) : (
              <>
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
                <div className="do2-footnote">
                  💡 Tip: Use the PDF export button to download a complete report of all filtered donations.
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button for Quick Export */}
      <div className="do2-floating-actions">
        <button 
          className="do2-floating-btn" 
          onClick={onDownloadPDF}
          disabled={loading || filtered.length === 0}
          title="Export PDF Report"
        >
          📥
        </button>
      </div>
    </div>
  );
};

export default DonationOverview;