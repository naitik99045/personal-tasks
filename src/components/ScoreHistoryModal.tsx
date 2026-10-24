import React from 'react';
import { useTasks } from '../context/TaskContext';
import { getScoreTier } from '../types';
import { X, Shield, ArrowUpRight, ArrowDownRight, RotateCcw, Award } from 'lucide-react';

interface ScoreHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoreHistoryModal: React.FC<ScoreHistoryModalProps> = ({ isOpen, onClose }) => {
  const { profile, scoreLogs, resetScoreToBaseline } = useTasks();
  const tierInfo = getScoreTier(profile.score);

  if (!isOpen) return null;

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
            <Award size={20} color="var(--brand-primary)" />
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Discipline Ledger</h2>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Current Score Summary Card */}
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--surface-overlay)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--surface-border)',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>CURRENT BALANCE</div>
            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
              {profile.score} <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>PTS</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className={`badge ${tierInfo.colorClass}`}>
              <Shield size={12} />
              {tierInfo.tier}
            </span>
          </div>
        </div>

        {/* Rules Card */}
        <div style={{
          padding: '12px 14px',
          backgroundColor: 'var(--surface-overlay)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--surface-border)',
          marginBottom: '16px',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Core Accountability Mechanics:
          </div>
          <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <li>Starting Baseline: <strong>100 points</strong></li>
            <li>On-Time Task Finish: <strong style={{ color: 'var(--color-success)' }}>+10 points</strong></li>
            <li>Timer Timeout / Miss: <strong style={{ color: 'var(--color-penalty)' }}>-20 points</strong></li>
          </ul>
        </div>

        {/* Score Logs List */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
            Transaction History
          </div>
          {scoreLogs.length === 0 ? (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              No transactions recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {scoreLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--surface-overlay)',
                    border: '1px solid var(--surface-border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {log.delta > 0 ? (
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '999px',
                        backgroundColor: 'var(--color-success-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-success)'
                      }}>
                        <ArrowUpRight size={16} />
                      </div>
                    ) : log.delta < 0 ? (
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '999px',
                        backgroundColor: 'var(--color-penalty-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-penalty)'
                      }}>
                        <ArrowDownRight size={16} />
                      </div>
                    ) : (
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '999px',
                        backgroundColor: 'var(--surface-raised)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)'
                      }}>
                        <Shield size={14} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {log.reason}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {log.taskTitle} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 700,
                      color: log.delta > 0
                        ? 'var(--color-success)'
                        : log.delta < 0
                        ? 'var(--color-penalty)'
                        : 'var(--text-muted)'
                    }}>
                      {log.delta > 0 ? `+${log.delta}` : log.delta < 0 ? `${log.delta}` : '0'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      Bal: {log.scoreAfter}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reset Baseline Action */}
        <button
          onClick={resetScoreToBaseline}
          className="btn-secondary"
          style={{ width: '100%', padding: '10px', fontSize: 'var(--font-size-xs)' }}
        >
          <RotateCcw size={14} />
          <span>Reset Score to Baseline 100</span>
        </button>
      </div>
    </div>
  );
};
