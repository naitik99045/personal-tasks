import React from 'react';
import { useTasks } from '../context/TaskContext';
import { getScoreTier } from '../types';
import { Shield, History, UserCheck, UserX, PlusCircle, Flame } from 'lucide-react';

interface ScoreHeaderProps {
  onOpenHistory: () => void;
  onOpenAuth: () => void;
  onOpenNewTask: () => void;
}

export const ScoreHeader: React.FC<ScoreHeaderProps> = ({
  onOpenHistory,
  onOpenAuth,
  onOpenNewTask
}) => {
  const { profile, user, scoreNotification } = useTasks();
  const tierInfo = getScoreTier(profile.score);

  return (
    <header style={{
      padding: '16px 20px',
      backgroundColor: 'var(--surface-raised)',
      borderBottom: '1px solid var(--surface-border)'
    }}>
      {/* Top Bar: User info & Action icons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <button
          onClick={onOpenAuth}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            color: 'var(--text-secondary)',
            padding: 0
          }}
        >
          {user && !user.isAnonymous ? (
            <UserCheck size={18} color="oklch(68% 0.18 145)" />
          ) : (
            <UserX size={18} color="oklch(72% 0.015 260)" />
          )}
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
            {user ? (user.email ? user.email.split('@')[0] : 'Guest User') : 'Local Mode'}
          </span>
          <span style={{
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '999px',
            backgroundColor: user ? 'oklch(24% 0.06 145)' : 'oklch(22% 0.015 260)',
            color: user ? 'oklch(68% 0.18 145)' : 'var(--text-muted)'
          }}>
            {user ? 'Firebase Synced' : 'Guest'}
          </span>
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onOpenHistory}
            className="btn-icon"
            title="Score History Ledger"
            style={{ width: '36px', height: '36px' }}
          >
            <History size={16} />
          </button>
          <button
            onClick={onOpenNewTask}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: 'var(--font-size-xs)' }}
          >
            <PlusCircle size={15} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Main Score & Tier Display */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{
            fontSize: 'var(--font-size-xs)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            fontWeight: 600,
            marginBottom: '2px'
          }}>
            Discipline Score
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '10px'
          }}>
            <span style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: profile.score >= 100 ? 'var(--text-primary)' : 'var(--color-penalty)'
            }}>
              {profile.score}
            </span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              PTS
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span className={`badge ${tierInfo.colorClass}`}>
            <Shield size={12} />
            {tierInfo.tier}
          </span>
          <div style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)',
            marginTop: '4px'
          }}>
            {profile.tasksCompleted} Done • {profile.tasksMissed} Missed
          </div>
        </div>
      </div>

      {/* Animated Score Alert Pill */}
      {scoreNotification && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: scoreNotification.delta > 0
            ? 'var(--color-success-subtle)'
            : 'var(--color-penalty-subtle)',
          color: scoreNotification.delta > 0
            ? 'var(--color-success)'
            : 'var(--color-penalty)',
          border: `1px solid ${scoreNotification.delta > 0 ? 'oklch(40% 0.1 145)' : 'oklch(40% 0.12 25)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <Flame size={14} />
          <span>{scoreNotification.text}</span>
        </div>
      )}
    </header>
  );
};
