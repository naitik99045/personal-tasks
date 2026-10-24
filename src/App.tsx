import React, { useState } from 'react';
import { TaskProvider, useTasks } from './context/TaskContext';
import { ScoreHeader } from './components/ScoreHeader';
import { Clock3D } from './components/Clock3D';
import { SprintBanner } from './components/SprintBanner';
import { StartSprintModal } from './components/StartSprintModal';
import { SprintReportModal } from './components/SprintReportModal';
import { TaskCard } from './components/TaskCard';
import { CreateTaskModal } from './components/CreateTaskModal';
import { EndTaskModal } from './components/EndTaskModal';
import { ScoreHistoryModal } from './components/ScoreHistoryModal';
import { AuthModal } from './components/AuthModal';
import { Plus, CheckCircle2, Clock, AlertOctagon, Layers } from 'lucide-react';
import './styles/theme.css';

const MainScreen: React.FC = () => {
  const {
    tasks,
    profile,
    isSprintReportModalOpen,
    setIsSprintReportModalOpen
  } = useTasks();

  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'missed'>('active');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isStartSprintOpen, setIsStartSprintOpen] = useState(false);

  const activeTasks = tasks.filter(t => t.status === 'active');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const missedTasks = tasks.filter(t => t.status === 'missed');

  const filteredTasks =
    activeTab === 'active'
      ? activeTasks
      : activeTab === 'completed'
      ? completedTasks
      : missedTasks;

  return (
    <div className="app-container">
      {/* Top Discipline Score Header */}
      <ScoreHeader
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenNewTask={() => setIsNewTaskOpen(true)}
      />

      {/* 3D R3F Interactive Clock & Score Core Dial */}
      <section style={{
        padding: '8px 20px 0 20px',
        backgroundColor: 'var(--surface-raised)',
        borderBottom: '1px solid var(--surface-divider)',
        textAlign: 'center'
      }}>
        <Clock3D score={profile.score} activeTasksCount={activeTasks.length} />
        <div style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          paddingBottom: '10px'
        }}>
          {activeTasks.length > 0
            ? `${activeTasks.length} Clock Timer${activeTasks.length > 1 ? 's' : ''} Armed`
            : 'All Timers Standby'}
        </div>
      </section>

      {/* Multi-Day Sprint Countdown Banner (3, 4, 5 days) */}
      <SprintBanner
        onOpenStartModal={() => setIsStartSprintOpen(true)}
        onOpenReportModal={() => setIsSprintReportModalOpen(true)}
      />

      {/* Filter Tabs (Segmented Control - Strict Solid OKLCH) */}
      <nav style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '6px',
        padding: '8px 20px',
        backgroundColor: 'var(--surface-base)'
      }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            padding: '8px 4px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'active' ? 'var(--surface-overlay)' : 'transparent',
            border: `1px solid ${activeTab === 'active' ? 'var(--brand-border)' : 'transparent'}`,
            color: activeTab === 'active' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: 'var(--font-size-xs)'
          }}
        >
          <Clock size={14} />
          <span>Active ({activeTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          style={{
            padding: '8px 4px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'completed' ? 'var(--surface-overlay)' : 'transparent',
            border: `1px solid ${activeTab === 'completed' ? 'var(--brand-border)' : 'transparent'}`,
            color: activeTab === 'completed' ? 'var(--color-success)' : 'var(--text-muted)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: 'var(--font-size-xs)'
          }}
        >
          <CheckCircle2 size={14} />
          <span>Done ({completedTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('missed')}
          style={{
            padding: '8px 4px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'missed' ? 'var(--surface-overlay)' : 'transparent',
            border: `1px solid ${activeTab === 'missed' ? 'var(--brand-border)' : 'transparent'}`,
            color: activeTab === 'missed' ? 'var(--color-penalty)' : 'var(--text-muted)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: 'var(--font-size-xs)'
          }}
        >
          <AlertOctagon size={14} />
          <span>Missed ({missedTasks.length})</span>
        </button>
      </nav>

      {/* Task List Content Area */}
      <main style={{
        flex: 1,
        padding: '0 20px 80px 20px',
        overflowY: 'auto'
      }}>
        {filteredTasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '999px',
              backgroundColor: 'var(--surface-raised)',
              margin: '0 auto 12px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={20} color="var(--text-secondary)" />
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {activeTab === 'active'
                ? 'No Active Tasks in Sprint'
                : activeTab === 'completed'
                ? 'No Completed Tasks Yet'
                : 'No Missed Deadlines — Perfect Record!'}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)' }}>
              {activeTab === 'active'
                ? 'Deploy single tasks or batch multi-tasks using the button below.'
                : ''}
            </div>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </main>

      {/* Floating Action Button (Android UX thumb zone) */}
      <button
        onClick={() => setIsNewTaskOpen(true)}
        className="btn-primary"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: 'calc(50% - var(--max-content-width) / 2 + 20px)',
          borderRadius: '999px',
          padding: '14px 22px',
          boxShadow: '0 10px 25px oklch(0% 0 0 / 0.4)',
          zIndex: 100,
          fontWeight: 600,
          fontSize: 'var(--font-size-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <Plus size={18} />
        <span>Add / Multi-Tasks</span>
      </button>

      {/* Modals & Bottom Sheets */}
      <CreateTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
      />
      <EndTaskModal />
      <ScoreHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
      <StartSprintModal
        isOpen={isStartSprintOpen}
        onClose={() => setIsStartSprintOpen(false)}
      />
      <SprintReportModal
        isOpen={isSprintReportModalOpen}
        onClose={() => setIsSprintReportModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <TaskProvider>
      <MainScreen />
    </TaskProvider>
  );
}
