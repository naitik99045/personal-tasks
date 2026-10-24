import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { Calendar, AlertCircle, Play, FileCheck, X } from 'lucide-react';

interface SprintBannerProps {
  onOpenStartModal: () => void;
  onOpenReportModal: () => void;
}

export const SprintBanner: React.FC<SprintBannerProps> = ({
  onOpenStartModal,
  onOpenReportModal
}) => {
  const { activeSprint, cancelSprint } = useTasks();
  const [countdownText, setCountdownText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    if (!activeSprint) return;

    const updateTimer = () => {
      const now = Date.now();
      const start = new Date(activeSprint.startDate).getTime();
      const end = new Date(activeSprint.endDate).getTime();
      const total = end - start;
      const remaining = end - now;

      if (remaining <= 0) {
        setIsEnded(true);
        setCountdownText('00d 00h 00m 00s (Ended)');
        setProgressPercent(100);
      } else {
        setIsEnded(false);
        const elapsed = Math.min(total, Math.max(0, now - start));
        setProgressPercent(Math.min(100, Math.round((elapsed / total) * 100)));

        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        setCountdownText(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSprint]);

  if (!activeSprint) {
    return (
      <div style={{
        margin: '12px 20px',
        padding: '12px 16px',
        backgroundColor: 'var(--surface-raised)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--surface-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--brand-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-primary)'
          }}>
            <Calendar size={18} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Multi-Day Sprint</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Set 3, 4, or 5 days timer & submit final report
            </div>
          </div>
        </div>

        <button
          onClick={onOpenStartModal}
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: 'var(--font-size-xs)' }}
        >
          <Play size={14} />
          <span>Launch</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{
      margin: '12px 20px',
      padding: '14px 16px',
      backgroundColor: isEnded ? 'var(--color-penalty-subtle)' : 'var(--surface-raised)',
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${isEnded ? 'oklch(40% 0.12 25)' : 'var(--brand-border)'}`,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${isEnded ? 'badge-penalty' : 'badge-brand'}`}>
            {activeSprint.durationDays}-Day Sprint
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {activeSprint.name}
          </span>
        </div>

        <button
          onClick={cancelSprint}
          style={{ background: 'none', color: 'var(--text-muted)', padding: '2px' }}
          title="Cancel Sprint"
        >
          <X size={15} />
        </button>
      </div>

      {/* Countdown Timer Display */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <div style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
          color: isEnded ? 'var(--color-penalty)' : 'var(--text-primary)'
        }}>
          {countdownText}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {progressPercent}% Elapsed
        </div>
      </div>

      {/* Progress Bar (Strictly Solid OKLCH) */}
      <div style={{
        width: '100%',
        height: '6px',
        backgroundColor: 'var(--surface-base)',
        borderRadius: '999px',
        overflow: 'hidden',
        marginBottom: '10px'
      }}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          backgroundColor: isEnded ? 'var(--color-penalty)' : 'var(--brand-primary)',
          transition: 'width 0.4s ease'
        }} />
      </div>

      {/* Action / Alert Row */}
      {isEnded ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--color-penalty)', fontWeight: 600 }}>
            <AlertCircle size={15} />
            <span>Sprint ended! Submit report now</span>
          </div>
          <button
            onClick={onOpenReportModal}
            className="btn-success"
            style={{ fontSize: 'var(--font-size-xs)', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileCheck size={14} />
            <span>Submit Report</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>Notification will trigger at 00:00</span>
          <button
            onClick={onOpenReportModal}
            style={{ background: 'none', color: 'var(--brand-primary)', fontSize: '11px', fontWeight: 600, padding: 0 }}
          >
            Preview Report
          </button>
        </div>
      )}
    </div>
  );
};
