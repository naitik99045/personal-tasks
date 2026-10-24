import React, { useState, useEffect } from 'react';
import type { Task } from '../types';
import { useTasks } from '../context/TaskContext';
import { Clock, CheckCircle2, AlertTriangle, FileText, Trash2, ChevronDown, ChevronUp, Link2, ExternalLink, ShieldCheck } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { setTaskToEnd, deleteTask, updateNotes } = useTasks();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isOverdue, setIsOverdue] = useState<boolean>(false);
  const [isNotesExpanded, setIsNotesExpanded] = useState<boolean>(false);
  const [isDeliverableExpanded, setIsDeliverableExpanded] = useState<boolean>(false);
  const [editingNotes, setEditingNotes] = useState<boolean>(false);
  const [noteContent, setNoteContent] = useState<string>(task.notes);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const deadline = new Date(task.deadline).getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setIsOverdue(true);
        const overdueMinutes = Math.floor(Math.abs(diff) / (1000 * 60));
        setTimeRemaining(`Overdue by ${overdueMinutes}m`);
      } else {
        setIsOverdue(false);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeRemaining(`${minutes}m ${seconds}s`);
        }
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [task.deadline]);

  const handleSaveNotes = async () => {
    await updateNotes(task.id, noteContent);
    setEditingNotes(false);
  };

  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'high':
        return <span className="badge badge-penalty">High</span>;
      case 'medium':
        return <span className="badge badge-warning">Medium</span>;
      default:
        return <span className="badge badge-brand">Low</span>;
    }
  };

  return (
    <div className="card" style={{ marginBottom: '12px', position: 'relative' }}>
      {/* Header Row: Title & Action */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 600,
            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
            color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)'
          }}>
            {task.title}
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
            {getPriorityBadge()}
            {task.status === 'completed' && (
              <span className="badge badge-success">Done (+10 pts)</span>
            )}
            {task.status === 'missed' && (
              <span className="badge badge-penalty">Timeout (-20 pts)</span>
            )}
            {task.submission && (
              <span className="badge badge-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} />
                <span>Deliverable Logged</span>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => deleteTask(task.id)}
          style={{
            background: 'none',
            color: 'var(--text-muted)',
            padding: '4px'
          }}
          title="Delete Task"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Clock Timer & End Task Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '12px',
        padding: '8px 12px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: task.status === 'completed'
          ? 'var(--surface-overlay)'
          : isOverdue
          ? 'var(--color-penalty-subtle)'
          : 'var(--surface-overlay)',
        border: `1px solid ${
          isOverdue && task.status === 'active'
            ? 'oklch(40% 0.12 25)'
            : 'var(--surface-border)'
        }`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isOverdue && task.status === 'active' ? (
            <AlertTriangle size={16} color="var(--color-penalty)" />
          ) : (
            <Clock size={16} color={task.status === 'completed' ? 'var(--text-muted)' : 'var(--brand-primary)'} />
          )}
          <span style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            color: task.status === 'completed'
              ? 'var(--text-muted)'
              : isOverdue
              ? 'var(--color-penalty)'
              : 'var(--text-primary)'
          }}>
            {task.status === 'completed' ? 'Completed' : timeRemaining}
          </span>
        </div>

        {task.status === 'active' && (
          <button
            onClick={() => setTaskToEnd(task)}
            className="btn-success"
            style={{ fontSize: 'var(--font-size-xs)', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCircle2 size={14} />
            <span>End Task (+10)</span>
          </button>
        )}
      </div>

      {/* Task End Response (Deliverable View) */}
      {task.submission && (
        <div style={{
          marginTop: '10px',
          padding: '10px 12px',
          backgroundColor: 'var(--surface-overlay)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid oklch(35% 0.05 145)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Proof of Work Deliverable
            </span>
            <button
              onClick={() => setIsDeliverableExpanded(!isDeliverableExpanded)}
              style={{ background: 'none', color: 'var(--text-secondary)', padding: 0 }}
            >
              {isDeliverableExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)', marginTop: '4px', fontWeight: 500 }}>
            {task.submission.deliverableSummary}
          </div>

          {isDeliverableExpanded && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--surface-border)' }}>
              {task.submission.outputUrl && (
                <div style={{ marginBottom: '6px' }}>
                  <a
                    href={task.submission.outputUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--brand-primary)',
                      fontSize: 'var(--font-size-xs)',
                      textDecoration: 'none',
                      fontWeight: 600
                    }}
                  >
                    <Link2 size={12} />
                    <span>View Output Deliverable</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
              {task.submission.reflectionNotes && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                  {task.submission.reflectionNotes}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Notes Accordion */}
      <div style={{ marginTop: '10px' }}>
        <button
          onClick={() => setIsNotesExpanded(!isNotesExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-xs)',
            padding: '2px 0'
          }}
        >
          <FileText size={14} />
          <span>{task.notes ? 'View Notes' : 'Add Notes'}</span>
          {isNotesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {isNotesExpanded && (
          <div style={{
            marginTop: '8px',
            padding: '10px',
            backgroundColor: 'var(--surface-overlay)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--surface-border)'
          }}>
            {editingNotes ? (
              <div>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Task notes, checklist, links..."
                  style={{ minHeight: '90px', marginBottom: '8px' }}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setEditingNotes(false)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: 'var(--font-size-xs)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: 'var(--font-size-xs)' }}
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                  marginBottom: '8px'
                }}>
                  {task.notes || <span style={{ color: 'var(--text-muted)' }}>No notes attached yet.</span>}
                </div>
                <button
                  onClick={() => setEditingNotes(true)}
                  style={{
                    background: 'none',
                    color: 'var(--brand-primary)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    padding: 0
                  }}
                >
                  Edit Notes
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
