import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { interviewService } from "../services/interviewService";
import "../styles/expandedrow.css";
import RichTextEditor from "./RichTextEditor";

const HISTORY_CONFIG = {
  created: { icon: "✨", bg: "#d1fae5", color: "#059669" },
  status_changed: { icon: "🔄", bg: "#dbeafe", color: "#1565c0" },
  comment_added: { icon: "💬", bg: "#ede9fe", color: "#7c3aed" },
};

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-IN");
}

function ExpandedRow({ interview, colSpan }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, h] = await Promise.all([
        interviewService.getComments(interview.id),
        interviewService.getHistory(interview.id),
      ]);
      setComments(c);
      setHistory(h);
    } finally {
      setLoading(false);
    }
  }, [interview.id]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddComment = async ({ html, text }) => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const comment = await interviewService.addComment(
        interview.id,
        text.trim(),
        html,
      );
      setComments((prev) => [...prev, comment]);
      setHistory((prev) => [
        {
          id: Date.now(),
          type: "comment_added",
          to_value: text.trim().substring(0, 80),
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    await interviewService.deleteComment(interview.id, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const renderHistoryText = (item) => {
    if (item.type === "created") {
      return (
        <span className="history-text">
          Interview created for <strong>{item.to_value}</strong>
        </span>
      );
    }
    if (item.type === "status_changed") {
      return (
        <span className="history-text">
          Status changed <span className="from">{item.from_value}</span>
          {" → "}
          <span className="to">{item.to_value}</span>
        </span>
      );
    }
    if (item.type === "comment_added") {
      return (
        <span className="history-text">Comment added: "{item.to_value}"</span>
      );
    }
  };

  return (
    <tr className="expanded-row">
      <td colSpan={colSpan}>
        <div className="expanded-content">
          {/* ── Comments Section ── */}
          <div className="exp-section">
            <div className="exp-section-header">
              <h4>
                💬 Comments
                <span
                  style={{
                    background: "#e0e7ff",
                    color: "#1565c0",
                    padding: "1px 8px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {comments.length}
                </span>
              </h4>
            </div>

            <div className="exp-section-body">
              {loading ? (
                <div className="exp-loading">Loading...</div>
              ) : comments.length === 0 ? (
                <div className="exp-empty">
                  No comments yet — add one below!
                </div>
              ) : (
                comments.map((c) => (
                  <div className="comment-item" key={c.id}>
                    <div className="comment-header">
                      <div className="comment-meta">
                        <div className="comment-avatar">{initials}</div>
                        <span className="comment-time">
                          {timeAgo(c.created_at)}
                        </span>
                      </div>
                      <button
                        className="comment-delete"
                        onClick={() => handleDeleteComment(c.id)}
                        title="Delete comment"
                      >
                        🗑️
                      </button>
                    </div>
                    <p
                      className="comment-text comment-html"
                      dangerouslySetInnerHTML={{
                        __html: c.content_html || c.content,
                      }}
                    />
                  </div>
                ))
              )}

              {/* Add comment */}
              <RichTextEditor
                onSubmit={handleAddComment}
                disabled={submitting}
              />
            </div>
          </div>

          {/* ── History Section ── */}
          <div className="exp-section">
            <div className="exp-section-header">
              <h4>📋 History</h4>
            </div>

            <div className="exp-section-body">
              {loading ? (
                <div className="exp-loading">Loading...</div>
              ) : history.length === 0 ? (
                <div className="exp-empty">No history yet</div>
              ) : (
                history.map((item, i) => {
                  const config =
                    HISTORY_CONFIG[item.type] || HISTORY_CONFIG.created;
                  return (
                    <div className="history-item" key={item.id || i}>
                      <div
                        className="history-dot"
                        style={{ background: config.bg }}
                      >
                        {config.icon}
                      </div>
                      <div className="history-info">
                        {renderHistoryText(item)}
                        <div className="history-time">
                          {timeAgo(item.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default ExpandedRow;
