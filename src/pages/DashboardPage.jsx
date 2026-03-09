import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Layout from "../components/Layout";
import { interviewService } from "../services/interviewService";
import "../styles/dashboard.css";

const STATUS_COLORS = {
  phone: "#1565c0",
  screening: "#7c3aed",
  interview: "#059669",
  rejected: "#dc2626",
  ghosted: "#9ca3af",
  uninteresting: "#d97706",
};

const STAT_CARDS = [
  {
    key: "total",
    label: "Total Applied",
    icon: "📁",
    bg: "#e8f0fe",
    color: "#1565c0",
  },
  {
    key: "interview",
    label: "Interviews",
    icon: "🎯",
    bg: "#d1fae5",
    color: "#059669",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: "❌",
    bg: "#fee2e2",
    color: "#dc2626",
  },
  {
    key: "ghosted",
    label: "Ghosted",
    icon: "👻",
    bg: "#f3f4f6",
    color: "#6b7280",
  },
  {
    key: "offer",
    label: "Offers",
    icon: "🏆",
    bg: "#fef3c7",
    color: "#d97706",
  },
  {
    key: "uninteresting",
    label: "Passed",
    icon: "🚫",
    bg: "#ede9fe",
    color: "#7c3aed",
  },
];

function DashboardPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    interviewService
      .getAll()
      .then(setInterviews)
      .finally(() => setLoading(false));
  }, []);

  // ── Derived Stats ──
  const stats = {
    total: interviews.length,
    interview: interviews.filter((i) => i.status === "interview").length,
    rejected: interviews.filter((i) => i.status === "rejected").length,
    ghosted: interviews.filter((i) => i.status === "ghosted").length,
    offer: interviews.filter((i) => i.status === "offer").length,
    uninteresting: interviews.filter((i) => i.status === "uninteresting")
      .length,
  };

  // ── Pie Chart Data ──
  const pieData = Object.entries(STATUS_COLORS)
    .map(([status, color]) => ({
      name: status,
      value: interviews.filter((i) => i.status === status).length,
      color,
    }))
    .filter((d) => d.value > 0);

  // ── Bar Chart — applications per month ──
  const monthMap = {};
  interviews.forEach((i) => {
    const month = new Date(i.applied_date).toLocaleString("default", {
      month: "short",
      year: "2-digit",
    });
    monthMap[month] = (monthMap[month] || 0) + 1;
  });
  const barData = Object.entries(monthMap)
    .map(([month, count]) => ({ month, count }))
    .slice(-6); // last 6 months

  // ── Recent 5 ──
  const recent = [...interviews]
    .sort((a, b) => new Date(b.applied_date) - new Date(a.applied_date))
    .slice(0, 5);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="dashboard-loading">Loading dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Dashboard"
      actions={
        <button
          className="btn btn-primary"
          style={{ fontSize: 12, padding: "6px 14px", borderRadius: "6px" }}
          onClick={() => navigate("/interviews")}
        >
          + Add Interview
        </button>
      }
    >
      <div className="dashboard-grid">
        {/* ── Stat Cards ── */}
        <div className="stats-row">
          {STAT_CARDS.map((card) => (
            <div className="stat-card" key={card.key}>
              <div className="stat-card-top">
                <div className="stat-icon" style={{ background: card.bg }}>
                  {card.icon}
                </div>
              </div>
              <div className="stat-value" style={{ color: card.color }}>
                {stats[card.key]}
              </div>
              <div className="stat-label">{card.label}</div>
            </div>
          ))}
        </div>

        {/* ── Charts ── */}
        <div className="charts-row">
          {/* Pie — status breakdown */}
          <div className="chart-card">
            <h3>Status Breakdown</h3>
            {pieData.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                No data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e0e7ff",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Legend */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: 8,
              }}
            >
              {pieData.map((d, i) => (
                <span
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    color: "var(--text-secondary)",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: d.color,
                      display: "inline-block",
                    }}
                  />
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </div>

          {/* Bar — applications per month */}
          <div className="chart-card">
            <h3>Applications per Month</h3>
            {barData.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                No data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData} barSize={32}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e0e7ff"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e0e7ff",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                  />
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f5a623" />
                      <stop offset="100%" stopColor="#e8445a" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Recent Interviews ── */}
        <div className="recent-card">
          <div className="recent-card-header">
            <h3>Recent Applications</h3>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 12, padding: "6px 12px" }}
              onClick={() => navigate("/interviews")}
            >
              View all →
            </button>
          </div>

          {recent.length === 0 ? (
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 13,
                padding: "16px 0",
              }}
            >
              No interviews added yet.
            </p>
          ) : (
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role / HR</th>
                  <th>Location</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((i) => (
                  <tr key={i.id}>
                    <td style={{ fontWeight: 600 }}>{i.company}</td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {i.hr_name || "—"}
                    </td>
                    <td>{i.location}</td>
                    <td>
                      <span className={`mode-badge mode-${i.mode_of_work}`}>
                        {i.mode_of_work}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill status-${i.status}`}>
                        {i.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {new Date(i.applied_date).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default DashboardPage;
