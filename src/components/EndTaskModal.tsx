import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { X, CheckCircle2, Link2, FileCheck, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export const EndTaskModal: React.FC = () => {
  const { taskToEnd, setTaskToEnd, completeTaskWithSubmission } = useTasks();
  const [deliverableSummary, setDeliverableSummary] = useState('');
  const [outputUrl, setOutputUrl] = useState('');
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!taskToEnd) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableSummary.trim()) return;

    setIsSubmitting(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.75 },
      colors: ['#2563eb', '#10b981', '#38bdf8']
    });

    await completeTaskWithSubmission(taskToEnd.id, {
      deliverableSummary,
      outputUrl,
      reflectionNotes
    });

    setDeliverableSummary('');
    setOutputUrl('');
    setReflectionNotes('');
    setIsSubmitting(false);
  };

  return (
    <div className="modal-backdrop" onClick={() => setTaskToEnd(null)}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={20} color="var(--color-success)" />
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
              End Task & Submit Deliverable
            </h2>
          </div>
          <button
            onClick={() => setTaskToEnd(null)}
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Task Target Card */}
        <div style={{
          padding: '12px 14px',
          backgroundColor: 'var(--surface-overlay)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--surface-border)',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Completed Objective
          </div>
          <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
            {taskToEnd.title}
          </div>
          {taskToEnd.notes && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
              {taskToEnd.notes}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Deliverable Summary */}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              What did you create / accomplish? *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Built the complete responsive UI layout and pushed commits"
              value={deliverableSummary}
              onChange={(e) => setDeliverableSummary(e.target.value)}
            />
          </div>

          {/* Deliverable Output Link */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <Link2 size={13} />
              <span>Deliverable / Output URL (Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://github.com/... or Figma / Doc link"
              value={outputUrl}
              onChange={(e) => setOutputUrl(e.target.value)}
            />
          </div>

          {/* Submission Notes */}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Reflection / Execution Proof (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Key notes, testing outcome, or verification steps..."
              value={reflectionNotes}
              onChange={(e) => setReflectionNotes(e.target.value)}
            />
          </div>

          {/* Points reward banner */}
          <div style={{
            padding: '10px 12px',
            backgroundColor: 'var(--color-success-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid oklch(40% 0.1 145)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Award size={16} color="var(--color-success)" />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 600 }}>
              On-time verification: You will receive <strong>+10 Discipline Points</strong>.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-success"
            style={{
              padding: '14px',
              fontSize: 'var(--font-size-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={16} />
            <span>Submit Deliverable & Claim +10 PTS</span>
          </button>
        </form>
      </div>
    </div>
  );
};
