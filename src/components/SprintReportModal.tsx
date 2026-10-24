import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { X, FileText, CheckCircle2, AlertTriangle, Award, Flame, CloudUpload } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SprintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SprintReportModal: React.FC<SprintReportModalProps> = ({ isOpen, onClose }) => {
  const { activeSprint, profile, submitSprintReport } = useTasks();
  const [userNotes, setUserNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !activeSprint) return null;

  const tasksDone = Math.max(0, profile.tasksCompleted - activeSprint.startCompletedCount);
  const tasksMissed = Math.max(0, profile.tasksMissed - activeSprint.startMissedCount);
  const totalTasks = tasksDone + tasksMissed;
  const completionRate = totalTasks > 0 ? Math.round((tasksDone / totalTasks) * 100) : (tasksDone > 0 ? 100 : 0);
  const netScoreDelta = profile.score - activeSprint.startScore;
  const isMastery = completionRate >= 80 && tasksDone > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isMastery) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#38bdf8']
      });
    }

    await submitSprintReport(userNotes);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--brand-primary)" />
            <div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                Sprint Completion Audit
              </h2>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                {activeSprint.name} • {activeSprint.durationDays} Days Timer
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Accountability Scorecard Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '16px'
        }}>
          {/* Tasks Done */}
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--surface-overlay)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--surface-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 600 }}>
              <CheckCircle2 size={14} />
              <span>Tasks Done</span>
            </div>
            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginTop: '4px' }}>
              {tasksDone}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              +{tasksDone * 10} PTS Earned
            </div>
          </div>

          {/* Tasks Missed */}
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--surface-overlay)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--surface-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--color-penalty)', fontWeight: 600 }}>
              <AlertTriangle size={14} />
              <span>Missed Timers</span>
            </div>
            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginTop: '4px' }}>
              {tasksMissed}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              -{tasksMissed * 20} PTS Penalties
            </div>
          </div>

          {/* Completion Rate */}
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--surface-overlay)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--surface-border)'
          }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
              COMPLETION RATE
            </div>
            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginTop: '4px' }}>
              {completionRate}%
            </div>
            <div style={{ fontSize: '11px', color: isMastery ? 'var(--color-success)' : 'var(--text-muted)' }}>
              {isMastery ? 'Target Met (>=80%)' : 'Target: >= 80%'}
            </div>
          </div>

          {/* Net Score Change */}
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--surface-overlay)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--surface-border)'
          }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
              DISCIPLINE NET
            </div>
            <div style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 700,
              marginTop: '4px',
              color: netScoreDelta >= 0 ? 'var(--color-success)' : 'var(--color-penalty)'
            }}>
              {netScoreDelta >= 0 ? `+${netScoreDelta}` : netScoreDelta} <span style={{ fontSize: 'var(--font-size-xs)' }}>PTS</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Current: {profile.score} PTS
            </div>
          </div>
        </div>

        {/* Sprint Mastery Bonus Banner */}
        {isMastery && (
          <div style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-success-subtle)',
            border: '1px solid oklch(40% 0.1 145)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Award size={24} color="var(--color-success)" />
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-success)' }}>
                Sprint Mastery Unlocked: +50 PTS Bonus!
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                Congratulations! You achieved {completionRate}% task success during this {activeSprint.durationDays}-day sprint.
              </div>
            </div>
          </div>
        )}

        {/* User Submission Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Operative Reflection & Report Notes *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Detail your completed milestones, roadblocks encountered, or adjustments for the next cycle..."
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <CloudUpload size={16} />
            <span>Submit Official Report to Firebase</span>
          </button>
        </form>
      </div>
    </div>
  );
};
