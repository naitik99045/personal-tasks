import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import type { TaskPriority } from '../types';
import { X, Clock, Plus, Trash2, Layers, CheckSquare, AlertCircle } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BatchItem {
  id: string;
  title: string;
  notes: string;
  priority: TaskPriority;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, addMultipleTasks } = useTasks();
  const [mode, setMode] = useState<'single' | 'batch'>('single');

  // Single Task States
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [timerMinutes, setTimerMinutes] = useState<number>(30);
  const [useCustomDate, setUseCustomDate] = useState<boolean>(false);
  const [customDateTime, setCustomDateTime] = useState<string>('');

  // Batch Multi-Task States
  const [batchItems, setBatchItems] = useState<BatchItem[]>([
    { id: '1', title: '', notes: '', priority: 'medium' },
    { id: '2', title: '', notes: '', priority: 'medium' }
  ]);
  const [batchTimerMinutes, setBatchTimerMinutes] = useState<number>(60);

  if (!isOpen) return null;

  const timerPresets = [
    { label: '15m', minutes: 15 },
    { label: '30m', minutes: 30 },
    { label: '1h', minutes: 60 },
    { label: '2h', minutes: 120 },
    { label: '4h', minutes: 240 }
  ];

  // Submit Single Task
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let deadlineDate: Date;
    if (useCustomDate && customDateTime) {
      deadlineDate = new Date(customDateTime);
    } else {
      deadlineDate = new Date(Date.now() + timerMinutes * 60 * 1000);
    }

    await addTask(title, notes, priority, deadlineDate);
    setTitle('');
    setNotes('');
    setPriority('medium');
    onClose();
  };

  // Submit Batch Multi-Tasks
  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = batchItems.filter(b => b.title.trim().length > 0);
    if (!validItems.length) return;

    const deadlineDate = new Date(Date.now() + batchTimerMinutes * 60 * 1000);

    const taskInputs = validItems.map(item => ({
      title: item.title,
      notes: item.notes,
      priority: item.priority,
      deadlineDate
    }));

    await addMultipleTasks(taskInputs);
    setBatchItems([
      { id: '1', title: '', notes: '', priority: 'medium' },
      { id: '2', title: '', notes: '', priority: 'medium' }
    ]);
    onClose();
  };

  const addBatchRow = () => {
    setBatchItems(prev => [
      ...prev,
      { id: Date.now().toString(), title: '', notes: '', priority: 'medium' }
    ]);
  };

  const removeBatchRow = (id: string) => {
    if (batchItems.length <= 1) return;
    setBatchItems(prev => prev.filter(b => b.id !== id));
  };

  const updateBatchRow = (id: string, field: keyof BatchItem, value: string) => {
    setBatchItems(prev =>
      prev.map(b => (b.id === id ? { ...b, [field]: value } : b))
    );
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
          <div>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
              {mode === 'single' ? 'Create Single Task' : 'Batch Multi-Tasks'}
            </h2>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Complete on time to earn +10 pts each.
            </p>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Mode Switcher: Single vs Batch */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '16px',
          backgroundColor: 'var(--surface-overlay)',
          padding: '4px',
          borderRadius: 'var(--radius-md)'
        }}>
          <button
            type="button"
            onClick={() => setMode('single')}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: mode === 'single' ? 'var(--brand-primary)' : 'transparent',
              color: mode === 'single' ? 'oklch(98% 0.005 260)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: 'var(--font-size-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <CheckSquare size={14} />
            <span>Single Task</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('batch')}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: mode === 'batch' ? 'var(--brand-primary)' : 'transparent',
              color: mode === 'batch' ? 'oklch(98% 0.005 260)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: 'var(--font-size-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Layers size={14} />
            <span>Batch Multi-Tasks</span>
          </button>
        </div>

        {mode === 'single' ? (
          /* ================= SINGLE TASK FORM ================= */
          <form onSubmit={handleSingleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Task Objective *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Implement Google OAuth with Firestore"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Context Notes (Optional)
              </label>
              <textarea
                placeholder="Checklist, links, acceptance criteria..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Priority Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${priority === p ? 'var(--brand-primary)' : 'var(--surface-border)'}`,
                      backgroundColor: priority === p ? 'var(--brand-subtle)' : 'var(--surface-overlay)',
                      color: priority === p ? 'oklch(90% 0.1 250)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Clock Countdown Timer *
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomDate(!useCustomDate)}
                  style={{ background: 'none', color: 'var(--brand-primary)', fontSize: '11px', padding: 0 }}
                >
                  {useCustomDate ? 'Quick Timer' : 'Custom Date/Time'}
                </button>
              </div>

              {!useCustomDate ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {timerPresets.map((preset) => (
                    <button
                      key={preset.minutes}
                      type="button"
                      onClick={() => setTimerMinutes(preset.minutes)}
                      style={{
                        flex: 1,
                        padding: '10px 4px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${timerMinutes === preset.minutes ? 'var(--brand-primary)' : 'var(--surface-border)'}`,
                        backgroundColor: timerMinutes === preset.minutes ? 'var(--brand-subtle)' : 'var(--surface-overlay)',
                        color: timerMinutes === preset.minutes ? 'oklch(90% 0.1 250)' : 'var(--text-primary)',
                        fontWeight: 600,
                        fontSize: 'var(--font-size-xs)'
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="datetime-local"
                  required={useCustomDate}
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                />
              )}
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '8px', padding: '14px' }}>
              Arm Clock & Add Task
            </button>
          </form>
        ) : (
          /* ================= BATCH MULTI-TASK FORM ================= */
          <form onSubmit={handleBatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Shared Sprint Timer for All Tasks
                </label>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {timerPresets.map((preset) => (
                  <button
                    key={preset.minutes}
                    type="button"
                    onClick={() => setBatchTimerMinutes(preset.minutes)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${batchTimerMinutes === preset.minutes ? 'var(--brand-primary)' : 'var(--surface-border)'}`,
                      backgroundColor: batchTimerMinutes === preset.minutes ? 'var(--brand-subtle)' : 'var(--surface-overlay)',
                      color: batchTimerMinutes === preset.minutes ? 'oklch(90% 0.1 250)' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: 'var(--font-size-xs)'
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Task Objectives ({batchItems.length})
                </label>
                <button
                  type="button"
                  onClick={addBatchRow}
                  style={{
                    background: 'none',
                    color: 'var(--brand-primary)',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <Plus size={13} />
                  <span>Add Another Task</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '2px' }}>
                {batchItems.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '10px',
                      backgroundColor: 'var(--surface-overlay)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--surface-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, width: '18px' }}>
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        placeholder={`Task ${index + 1} Title *`}
                        value={item.title}
                        onChange={(e) => updateBatchRow(item.id, 'title', e.target.value)}
                        style={{ flex: 1, padding: '8px 10px', fontSize: 'var(--font-size-xs)' }}
                      />
                      {batchItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBatchRow(item.id)}
                          style={{ background: 'none', color: 'var(--text-muted)', padding: '4px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Optional notes or links..."
                      value={item.notes}
                      onChange={(e) => updateBatchRow(item.id, 'notes', e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '11px', backgroundColor: 'var(--surface-raised)' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '6px', padding: '14px' }}>
              Deploy All {batchItems.filter(b => b.title.trim()).length || batchItems.length} Tasks
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
