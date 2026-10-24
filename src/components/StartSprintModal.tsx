import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { X, Calendar, Award, Zap } from 'lucide-react';

interface StartSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StartSprintModal: React.FC<StartSprintModalProps> = ({ isOpen, onClose }) => {
  const { startSprint } = useTasks();
  const [selectedDays, setSelectedDays] = useState<number>(3);
  const [sprintName, setSprintName] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = sprintName.trim() || `${selectedDays}-Day Sprint`;
    await startSprint(selectedDays, finalName);
    onClose();
  };

  const dayPresets = [
    { days: 3, label: '3 Days', desc: 'Weekend / Rapid Push' },
    { days: 4, label: '4 Days', desc: 'Mid-week Deep Work' },
    { days: 5, label: '5 Days', desc: 'Full Work Week' },
    { days: 7, label: '7 Days', desc: 'Full Week Habit' }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--brand-primary)" />
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
              Launch Multi-Day Sprint
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Day Presets */}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Choose Sprint Duration *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {dayPresets.map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => setSelectedDays(preset.days)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${selectedDays === preset.days ? 'var(--brand-primary)' : 'var(--surface-border)'}`,
                    backgroundColor: selectedDays === preset.days ? 'var(--brand-subtle)' : 'var(--surface-overlay)',
                    color: selectedDays === preset.days ? 'oklch(90% 0.1 250)' : 'var(--text-primary)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>{preset.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sprint Mission Title */}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Sprint Mission Name (Optional)
            </label>
            <input
              type="text"
              placeholder={`e.g. Q4 Target Sprint (${selectedDays} Days)`}
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
            />
          </div>

          {/* Rules and Notification Banner */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--surface-overlay)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--surface-border)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)', fontWeight: 600 }}>
              <Zap size={14} />
              <span>Sprint Accountability Loop</span>
            </div>
            <div>• Timer counts down for {selectedDays} continuous days.</div>
            <div>• Android app notification alerts you at 0: <em>"Your timer has ended submit the reports how much task has done"</em>.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontWeight: 600, marginTop: '2px' }}>
              <Award size={14} />
              <span>Mastery Reward: +50 PTS Bonus if completion rate &ge; 80%!</span>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '14px', marginTop: '6px' }}>
            Arm {selectedDays}-Day Sprint Timer
          </button>
        </form>
      </div>
    </div>
  );
};
