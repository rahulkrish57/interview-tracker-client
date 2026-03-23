import { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout";
import { interviewService } from "../services/interviewService";
import "../styles/interviews.css";
import InterviewForm from "../components/InterviewForm";
import ExpandedRow from "../components/ExpandedRow";
const STATUS_OPTIONS = [
  "all",
  "phone",
  "screening",
  "interview",
  "rejected",
  "ghosted",
  "uninteresting",
];

const MODE_OPTIONS = ["all", "onsite", "hybrid", "remote"];

function DeleteModal({ company, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Delete Interview?</h3>
        <p>
          Are you sure you want to delete <strong>{company}</strong>? This
          action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("all");
  const [modeFilter, setMode] = useState("all");
  const [sortField, setSortField] = useState("applied_date");
  const [sortDir, setSortDir] = useState("desc");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editInterview, setEditInterview] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const data = await interviewService.getAll();
      setInterviews(data);
    } finally {
      setLoading(false);
    }
  };
  // ── Toggle expand ──
  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };
  // ── Sort handler ──
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortIcon = (field) => {
    if (sortField !== field) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  // ── Filtered + Sorted data ──
  const filtered = useMemo(() => {
    return interviews
      .filter((i) => {
        const q = search.toLowerCase();
        const matchSearch =
          i.company.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          (i.hr_name || "").toLowerCase().includes(q);
        const matchStatus = statusFilter === "all" || i.status === statusFilter;
        const matchMode = modeFilter === "all" || i.mode_of_work === modeFilter;
        return matchSearch && matchStatus && matchMode;
      })
      .sort((a, b) => {
        let valA = a[sortField] || "";
        let valB = b[sortField] || "";
        if (sortField === "applied_date") {
          valA = new Date(valA);
          valB = new Date(valB);
        } else {
          valA = valA.toString().toLowerCase();
          valB = valB.toString().toLowerCase();
        }
        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [interviews, search, statusFilter, modeFilter, sortField, sortDir]);

  // ── Delete ──
  const handleDelete = async () => {
    await interviewService.remove(deleteTarget.id);
    setInterviews((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // ── Save ──
  const handleSave = (saved, isEdit) => {
    if (isEdit) {
      setInterviews((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
    } else {
      setInterviews((prev) => [saved, ...prev]);
    }
  };
  return (
    <Layout
      title="All Interviews"
      actions={
        <button
          className="btn btn-primary"
          style={{ fontSize: 12, padding: "6px 14px", borderRadius: "6px" }}
          onClick={() => {
            setEditInterview(null);
            setShowForm(true);
          }}
        >
          + Add Interview
        </button>
      }
    >
      {/* ── Toolbar ── */}
      <div className="interviews-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search company, location, HR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all"
                ? "All Status"
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={modeFilter}
          onChange={(e) => setMode(e.target.value)}
        >
          {MODE_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m === "all"
                ? "All Modes"
                : m.charAt(0).toUpperCase() + m.slice(1)}
            </option>
          ))}
        </select>
      </div>
      {/* ── Table ── */}
      <div className="table-card">
        <div className="table-scroll">
          <table className="interviews-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("company")}>
                  Company {sortIcon("company")}
                </th>
                <th onClick={() => handleSort("location")}>
                  Location {sortIcon("location")}
                </th>
                <th>Mode</th>
                <th onClick={() => handleSort("status")}>
                  Status {sortIcon("status")}
                </th>
                <th>CTC</th>
                <th onClick={() => handleSort("applied_date")}>
                  Date {sortIcon("applied_date")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: 40,
                      color: "var(--text-secondary)",
                    }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <p>No interviews found</p>
                      <span>Try adjusting your search or filters</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((i) => (
                  <>
                    <tr key={i.id}>
                      <td>
                        <div
                          className="company-cell"
                          onClick={() => toggleExpand(i.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <span
                            className="company-name"
                            style={{ color: "var(--accent)" }}
                          >
                            {expandedId === i.id ? "▼" : "▶"} {i.company}
                          </span>
                          {i.hr_name && (
                            <span className="hr-name">👤 {i.hr_name}</span>
                          )}
                        </div>
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
                        {i.expected_ctc || "—"}
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {new Date(i.applied_date).toLocaleDateString("en-IN")}
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="btn-icon"
                            title="Edit"
                            onClick={() => {
                              setEditInterview(i);
                              setShowForm(true);
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon danger"
                            title="Delete"
                            onClick={() => setDeleteTarget(i)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === i.id && (
                      <ExpandedRow
                        key={`expanded-${i.id}`}
                        interview={i}
                        colSpan={7}
                      />
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && (
          <div className="table-footer">
            <span>
              Showing <strong>{filtered.length}</strong> of{" "}
              <strong>{interviews.length}</strong> interviews
            </span>
            {(search || statusFilter !== "all" || modeFilter !== "all") && (
              <button
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: "4px 10px" }}
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                  setMode("all");
                }}
              >
                Clear filters ✕
              </button>
            )}
          </div>
        )}
      </div>
      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          company={deleteTarget.company}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {showForm && (
        <InterviewForm
          interview={editInterview}
          onClose={() => {
            setShowForm(false);
            setEditInterview(null);
          }}
          onSaved={handleSave}
        />
      )}
    </Layout>
  );
}

export default InterviewsPage;
