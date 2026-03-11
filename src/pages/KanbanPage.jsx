import { useEffect, useState, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Layout from "../components/Layout";
import InterviewForm from "../components/InterviewForm";
import { interviewService } from "../services/interviewService";
import "../styles/kanban.css";

const COLUMNS = [
  { key: "phone", label: "Phone", color: "#1565c0" },
  { key: "screening", label: "Screening", color: "#7c3aed" },
  { key: "interview", label: "Interview", color: "#059669" },
  { key: "ghosted", label: "Ghosted", color: "#6b7280" },
  { key: "rejected", label: "Rejected", color: "#dc2626" },
  { key: "uninteresting", label: "Uninteresting", color: "#d97706" },
];

// ── Draggable Card ──
function DraggableCard({ interview, onEdit, onDelete, onStatusChange }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: interview.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    transition: isDragging ? "none" : "transform 0.2s",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CardContent
        interview={interview}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        dragHandleProps={{ ...listeners, ...attributes }}
      />
    </div>
  );
}

// ── Card UI (shared between draggable + overlay) ──
function CardContent({
  interview,
  onEdit,
  onDelete,
  onStatusChange,
  dragHandleProps = {},
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="kanban-card">
      <div className="kanban-card-top">
        {/* Drag handle */}
        <span className="drag-handle" {...dragHandleProps} title="Drag to move">
          ⠿
        </span>
        <span className="kanban-company">{interview.company}</span>
        <div className="kanban-card-actions">
          <button
            className="btn-icon"
            onClick={() => onEdit(interview)}
            title="Edit"
          >
            ✏️
          </button>
          <div className="status-dropdown-wrap" ref={ref}>
            <button
              className="btn-icon"
              title="Move to..."
              onClick={() => setShowDropdown((p) => !p)}
            >
              ↕️
            </button>
            {showDropdown && (
              <div className="status-dropdown">
                {COLUMNS.filter((c) => c.key !== interview.status).map(
                  (col) => (
                    <button
                      key={col.key}
                      onClick={() => {
                        onStatusChange(interview.id, col.key);
                        setShowDropdown(false);
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: col.color,
                          display: "inline-block",
                        }}
                      />
                      {col.label}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
          <button
            className="btn-icon danger"
            title="Delete"
            onClick={() => onDelete(interview)}
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="kanban-meta">
        {interview.hr_name && (
          <div className="kanban-meta-row">
            <span>👤</span>
            <span>{interview.hr_name}</span>
          </div>
        )}
        <div className="kanban-meta-row">
          <span>📍</span>
          <span>{interview.location}</span>
        </div>
        <div className="kanban-meta-row">
          <span>💼</span>
          <span className={`mode-badge mode-${interview.mode_of_work}`}>
            {interview.mode_of_work}
          </span>
        </div>
        {interview.expected_ctc && (
          <div className="kanban-meta-row">
            <span>💰</span>
            <span>{interview.expected_ctc}</span>
          </div>
        )}
        <div className="kanban-meta-row">
          <span>📅</span>
          <span>
            {new Date(interview.applied_date).toLocaleDateString("en-IN")}
          </span>
        </div>
      </div>

      {interview.notes && <div className="kanban-notes">{interview.notes}</div>}
    </div>
  );
}

// ── Droppable Column ──
function DroppableColumn({ col, cards, onEdit, onDelete, onStatusChange }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });

  return (
    <div
      className={`kanban-col ${isOver ? "kanban-col-over" : ""}`}
      key={col.key}
    >
      <div className="kanban-col-header">
        <div className="kanban-col-title">
          <span className="kanban-col-dot" style={{ background: col.color }} />
          {col.label}
        </div>
        <span className="kanban-count">{cards.length}</span>
      </div>

      <div className="kanban-cards" ref={setNodeRef}>
        {cards.length === 0 ? (
          <div className="kanban-empty">Drop here</div>
        ) : (
          cards.map((interview) => (
            <DraggableCard
              key={interview.id}
              interview={interview}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Main Page ──
function KanbanPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editInterview, setEditInterview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Sensors — supports both mouse and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await interviewService.getAll();
      setInterviews(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    const card = interviews.find((i) => i.id === event.active.id);
    setActiveCard(card);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);

    // over is the column key
    if (!over) return;
    const newStatus = over.id;
    const card = interviews.find((i) => i.id === active.id);

    // No change if dropped in same column
    if (!card || card.status === newStatus) return;

    // Optimistic update — update UI instantly
    setInterviews((prev) =>
      prev.map((i) => (i.id === card.id ? { ...i, status: newStatus } : i)),
    );

    // Then persist to backend
    try {
      await interviewService.update(card.id, { status: newStatus });
    } catch (err) {
      console.error(err);
      // Rollback on failure
      setInterviews((prev) =>
        prev.map((i) => (i.id === card.id ? { ...i, status: card.status } : i)),
      );
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const card = interviews.find((i) => i.id === id);
    setInterviews((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i)),
    );
    try {
      await interviewService.update(id, { status: newStatus });
    } catch {
      setInterviews((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: card.status } : i)),
      );
    }
  };

  const handleSaved = (saved, isEdit) => {
    if (isEdit) {
      setInterviews((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
    } else {
      setInterviews((prev) => [saved, ...prev]);
    }
  };

  const handleDelete = async () => {
    await interviewService.remove(deleteTarget.id);
    setInterviews((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const getByStatus = (status) => interviews.filter((i) => i.status === status);

  return (
    <Layout
      title="Kanban Board"
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
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "var(--text-secondary)",
          }}
        >
          Loading board...
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="kanban-board">
            {COLUMNS.map((col) => (
              <DroppableColumn
                key={col.key}
                col={col}
                cards={getByStatus(col.key)}
                onEdit={(i) => {
                  setEditInterview(i);
                  setShowForm(true);
                }}
                onDelete={setDeleteTarget}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>

          {/* Drag overlay — card that follows cursor */}
          <DragOverlay>
            {activeCard && (
              <div style={{ transform: "rotate(2deg)", opacity: 0.95 }}>
                <CardContent interview={activeCard} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {showForm && (
        <InterviewForm
          interview={editInterview}
          onClose={() => {
            setShowForm(false);
            setEditInterview(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Delete Interview?</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.company}</strong>?
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default KanbanPage;
