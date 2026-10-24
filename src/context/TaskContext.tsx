import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Task, ScoreLog, UserProfile, TaskPriority, Sprint, SprintReport, TaskSubmission } from '../types';
import {
  auth,
  ensureUserProfile,
  updateUserScore,
  saveTaskToCloud,
  deleteTaskFromCloud,
  logScoreChangeToCloud,
  saveSprintStateToCloud,
  saveSprintReportToCloud,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  loginAnonymously,
  logoutUser
} from '../services/firebase';
import {
  playChime,
  triggerHaptic,
  scheduleTaskDeadlineAlarm,
  cancelTaskDeadlineAlarm,
  scheduleSprintDeadlineAlarm,
  cancelSprintDeadlineAlarm
} from '../services/notifications';
import { onAuthStateChanged, User } from 'firebase/auth';

interface NewTaskInput {
  title: string;
  notes?: string;
  priority: TaskPriority;
  deadlineDate: Date;
}

interface TaskContextType {
  user: User | null;
  profile: UserProfile;
  tasks: Task[];
  scoreLogs: ScoreLog[];
  activeSprint: Sprint | null;
  sprintReports: SprintReport[];
  isLoading: boolean;
  scoreNotification: { delta: number; text: string; id: number } | null;
  isSprintReportModalOpen: boolean;
  setIsSprintReportModalOpen: (open: boolean) => void;
  taskToEnd: Task | null;
  setTaskToEnd: (task: Task | null) => void;
  addTask: (title: string, notes: string, priority: TaskPriority, deadlineDate: Date) => Promise<void>;
  addMultipleTasks: (tasksList: NewTaskInput[]) => Promise<void>;
  completeTaskWithSubmission: (taskId: string, submission: { deliverableSummary: string; outputUrl?: string; reflectionNotes?: string }) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateNotes: (taskId: string, notes: string) => Promise<void>;
  resetScoreToBaseline: () => Promise<void>;
  startSprint: (durationDays: number, name?: string) => Promise<void>;
  cancelSprint: () => Promise<void>;
  submitSprintReport: (userNotes: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (email: string, pass: string) => Promise<void>;
  signInGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_TASKS = 'chronotask_tasks_v2';
const LOCAL_STORAGE_KEY_LOGS = 'chronotask_logs_v2';
const LOCAL_STORAGE_KEY_PROFILE = 'chronotask_profile_v2';
const LOCAL_STORAGE_KEY_SPRINT = 'chronotask_sprint_v2';
const LOCAL_STORAGE_KEY_REPORTS = 'chronotask_reports_v2';

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSprintReportModalOpen, setIsSprintReportModalOpen] = useState(false);
  const [taskToEnd, setTaskToEnd] = useState<Task | null>(null);

  // Default User Profile with Baseline Score 100
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      uid: 'guest_local',
      email: null,
      displayName: 'Chrono Operative',
      photoURL: null,
      isAnonymous: true,
      score: 100, // PRD Baseline: 100 Points
      tasksCompleted: 0,
      tasksMissed: 0,
      createdAt: new Date().toISOString()
    };
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    const initialDeadline = new Date(Date.now() + 45 * 60 * 1000).toISOString();
    return [
      {
        id: 'task-starter-1',
        title: 'Review System Features & Multi-Tasking',
        notes: '- Baseline Score: 100 Points\n- Multi-Tasks: Add single or batch tasks\n- Task End Responses: Submit deliverables and proof\n- Google & Email Auth: Real-time cloud sync',
        priority: 'high',
        deadline: initialDeadline,
        createdAt: new Date().toISOString(),
        status: 'active',
        penaltyApplied: false,
        rewardApplied: false
      }
    ];
  });

  const [scoreLogs, setScoreLogs] = useState<ScoreLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LOGS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'init-log-0',
        delta: 100,
        reason: 'Initial Baseline Score',
        taskId: 'system',
        taskTitle: 'System Account Activation',
        scoreAfter: 100,
        timestamp: new Date().toISOString()
      }
    ];
  });

  const [activeSprint, setActiveSprint] = useState<Sprint | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SPRINT);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    const now = new Date();
    const end = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return {
      id: 'sprint-init-3d',
      name: '3-Day Discipline Sprint',
      durationDays: 3,
      startDate: now.toISOString(),
      endDate: end.toISOString(),
      status: 'active',
      startCompletedCount: 0,
      startMissedCount: 0,
      startScore: 100
    };
  });

  const [sprintReports, setSprintReports] = useState<SprintReport[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_REPORTS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  const [scoreNotification, setScoreNotification] = useState<{ delta: number; text: string; id: number } | null>(null);

  // Persistence to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify(scoreLogs));
  }, [scoreLogs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (activeSprint) {
      localStorage.setItem(LOCAL_STORAGE_KEY_SPRINT, JSON.stringify(activeSprint));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_SPRINT);
    }
  }, [activeSprint]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_REPORTS, JSON.stringify(sprintReports));
  }, [sprintReports]);

  // Firebase Auth State Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoading(true);
      if (fbUser) {
        setUser(fbUser);
        try {
          const userProf = await ensureUserProfile(fbUser);
          setProfile(prev => ({
            ...prev,
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || (fbUser.isAnonymous ? 'Guest Operative' : 'Chrono Pioneer'),
            photoURL: fbUser.photoURL || null,
            isAnonymous: fbUser.isAnonymous,
            score: userProf.score ?? prev.score
          }));
        } catch (e) {
          console.warn('Profile fetch fallback:', e);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showScorePopup = (delta: number, text: string) => {
    setScoreNotification({ delta, text, id: Date.now() });
    setTimeout(() => {
      setScoreNotification(null);
    }, 3500);
  };

  // Real-Time Interval Watcher: Deadlines & Multi-Day Sprint Timers
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      // Check Multi-Day Sprint Expiration (3, 4, 5 days)
      if (activeSprint && activeSprint.status === 'active') {
        const sprintEnd = new Date(activeSprint.endDate).getTime();
        if (sprintEnd <= now) {
          setActiveSprint(prev => prev ? { ...prev, status: 'ended' } : null);
          setIsSprintReportModalOpen(true);
          playChime('penalty');
          triggerHaptic('penalty');
          showScorePopup(0, `⏰ Your ${activeSprint.durationDays}-Day Sprint ended! Submit report now.`);
        }
      }

      // Check Task Timers (-20 penalty if expired)
      setTasks(currentTasks => {
        let stateChanged = false;
        let scorePenaltySum = 0;
        const newLogs: ScoreLog[] = [];

        const updatedTasks = currentTasks.map(task => {
          if (task.status === 'active' && !task.penaltyApplied) {
            const deadlineTime = new Date(task.deadline).getTime();
            if (deadlineTime <= now) {
              stateChanged = true;
              scorePenaltySum += 20;

              const log: ScoreLog = {
                id: `log-penalty-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                delta: -20,
                reason: 'Missed Task Deadline',
                taskId: task.id,
                taskTitle: task.title,
                scoreAfter: Math.max(0, profile.score - scorePenaltySum),
                timestamp: new Date().toISOString()
              };
              newLogs.push(log);

              playChime('penalty');
              triggerHaptic('penalty');

              return {
                ...task,
                status: 'missed' as const,
                penaltyApplied: true
              };
            }
          }
          return task;
        });

        if (stateChanged) {
          const newScore = Math.max(0, profile.score - scorePenaltySum);
          setProfile(prev => {
            const next = {
              ...prev,
              score: newScore,
              tasksMissed: prev.tasksMissed + newLogs.length
            };
            if (user) {
              updateUserScore(user.uid, newScore, 0, next.tasksMissed);
            }
            return next;
          });

          setScoreLogs(prevLogs => [...newLogs, ...prevLogs]);
          showScorePopup(-20, `Deadline missed: -20 pts penalty!`);

          newLogs.forEach(log => {
            if (user) logScoreChangeToCloud(user.uid, log);
          });

          return updatedTasks;
        }

        return currentTasks;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [profile.score, activeSprint, user]);

  // Action: Add Single Task
  const addTask = async (title: string, notes: string, priority: TaskPriority, deadlineDate: Date) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      notes: notes.trim(),
      priority,
      deadline: deadlineDate.toISOString(),
      createdAt: new Date().toISOString(),
      status: 'active',
      penaltyApplied: false,
      rewardApplied: false
    };

    setTasks(prev => [newTask, ...prev]);
    await scheduleTaskDeadlineAlarm(newTask);

    if (user) {
      await saveTaskToCloud(user.uid, newTask);
    }
  };

  // Action: Add Multi Tasks (Batch Deployment)
  const addMultipleTasks = async (tasksList: NewTaskInput[]) => {
    if (!tasksList.length) return;

    const createdTasks: Task[] = tasksList.map((input, idx) => ({
      id: `task-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      title: input.title.trim(),
      notes: (input.notes || '').trim(),
      priority: input.priority,
      deadline: input.deadlineDate.toISOString(),
      createdAt: new Date().toISOString(),
      status: 'active',
      penaltyApplied: false,
      rewardApplied: false
    }));

    setTasks(prev => [...createdTasks, ...prev]);

    for (const task of createdTasks) {
      await scheduleTaskDeadlineAlarm(task);
      if (user) {
        await saveTaskToCloud(user.uid, task);
      }
    }

    showScorePopup(0, `🚀 ${createdTasks.length} Tasks armed simultaneously!`);
  };

  // Action: Complete Task with Deliverable Submission
  const completeTaskWithSubmission = async (
    taskId: string,
    submissionData: { deliverableSummary: string; outputUrl?: string; reflectionNotes?: string }
  ) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target || target.status === 'completed') return;

    const isOnTime = new Date(target.deadline).getTime() > Date.now();
    const pointsDelta = isOnTime ? 10 : 0;
    const newScore = profile.score + pointsDelta;

    const submission: TaskSubmission = {
      deliverableSummary: submissionData.deliverableSummary.trim(),
      outputUrl: submissionData.outputUrl?.trim() || undefined,
      reflectionNotes: submissionData.reflectionNotes?.trim() || undefined,
      completedAt: new Date().toISOString()
    };

    const updatedTask: Task = {
      ...target,
      status: 'completed' as const,
      rewardApplied: true,
      completedAt: submission.completedAt,
      submission
    };

    setTasks(prev => prev.map(t => (t.id === taskId ? updatedTask : t)));

    setProfile(prev => {
      const next = {
        ...prev,
        score: newScore,
        tasksCompleted: prev.tasksCompleted + 1
      };
      if (user) {
        updateUserScore(user.uid, newScore, next.tasksCompleted, 0);
      }
      return next;
    });

    if (pointsDelta > 0) {
      const log: ScoreLog = {
        id: `log-reward-${Date.now()}`,
        delta: 10,
        reason: 'Task Finished & Deliverable Submitted',
        taskId: target.id,
        taskTitle: `${target.title}: ${submission.deliverableSummary}`,
        scoreAfter: newScore,
        timestamp: new Date().toISOString()
      };

      setScoreLogs(prev => [log, ...prev]);
      playChime('success');
      triggerHaptic('success');
      showScorePopup(10, `Deliverable Verified: +10 pts!`);

      if (user) {
        await logScoreChangeToCloud(user.uid, log);
      }
    }

    await cancelTaskDeadlineAlarm(taskId);

    if (user) {
      await saveTaskToCloud(user.uid, updatedTask);
    }

    setTaskToEnd(null);
  };

  // Action: Delete Task
  const deleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    await cancelTaskDeadlineAlarm(taskId);
    if (user) {
      await deleteTaskFromCloud(user.uid, taskId);
    }
  };

  // Action: Update Notes
  const updateNotes = async (taskId: string, notes: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, notes } : t))
    );
    const target = tasks.find(t => t.id === taskId);
    if (target && user) {
      await saveTaskToCloud(user.uid, { ...target, notes });
    }
  };

  // Action: Multi-Day Sprint
  const startSprint = async (durationDays: number, name?: string) => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const newSprint: Sprint = {
      id: `sprint-${Date.now()}-${durationDays}d`,
      name: name || `${durationDays}-Day Discipline Sprint`,
      durationDays,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      startCompletedCount: profile.tasksCompleted,
      startMissedCount: profile.tasksMissed,
      startScore: profile.score
    };

    setActiveSprint(newSprint);
    await scheduleSprintDeadlineAlarm(newSprint);

    if (user) {
      await saveSprintStateToCloud(user.uid, newSprint);
    }

    showScorePopup(0, `🚀 ${durationDays}-Day Sprint active!`);
  };

  const cancelSprint = async () => {
    if (activeSprint) {
      await cancelSprintDeadlineAlarm(activeSprint);
    }
    setActiveSprint(null);
    if (user) {
      await saveSprintStateToCloud(user.uid, null);
    }
  };

  const submitSprintReport = async (userNotes: string) => {
    if (!activeSprint) return;

    const tasksDone = Math.max(0, profile.tasksCompleted - activeSprint.startCompletedCount);
    const tasksMissed = Math.max(0, profile.tasksMissed - activeSprint.startMissedCount);
    const totalAttempted = tasksDone + tasksMissed;
    const completionRate = totalAttempted > 0 ? Math.round((tasksDone / totalAttempted) * 100) : 100;
    const netScoreDelta = profile.score - activeSprint.startScore;

    const isMastery = completionRate >= 80 && tasksDone > 0;
    const bonusAwarded = isMastery ? 50 : 0;

    let finalScore = profile.score;
    if (bonusAwarded > 0) {
      finalScore += bonusAwarded;
      setProfile(prev => ({
        ...prev,
        score: finalScore
      }));

      const bonusLog: ScoreLog = {
        id: `log-sprint-bonus-${Date.now()}`,
        delta: bonusAwarded,
        reason: `${activeSprint.durationDays}-Day Sprint Mastery Bonus`,
        taskId: activeSprint.id,
        taskTitle: `${activeSprint.name} (${completionRate}% Done)`,
        scoreAfter: finalScore,
        timestamp: new Date().toISOString()
      };

      setScoreLogs(prev => [bonusLog, ...prev]);
      playChime('success');
      triggerHaptic('success');
      showScorePopup(bonusAwarded, `🏆 Sprint Mastery: +${bonusAwarded} PTS Bonus!`);

      if (user) {
        await updateUserScore(user.uid, finalScore);
        await logScoreChangeToCloud(user.uid, bonusLog);
      }
    }

    const report: SprintReport = {
      id: `report-${Date.now()}`,
      sprintId: activeSprint.id,
      sprintName: activeSprint.name,
      durationDays: activeSprint.durationDays,
      startDate: activeSprint.startDate,
      endDate: activeSprint.endDate,
      submittedAt: new Date().toISOString(),
      tasksDoneCount: tasksDone,
      tasksMissedCount: tasksMissed,
      completionRate,
      netScoreChange: netScoreDelta + bonusAwarded,
      userNotes,
      bonusAwarded
    };

    setSprintReports(prev => [report, ...prev]);
    setActiveSprint(null);
    setIsSprintReportModalOpen(false);

    if (user) {
      await saveSprintReportToCloud(user.uid, report);
      await saveSprintStateToCloud(user.uid, null);
    }
  };

  const resetScoreToBaseline = async () => {
    setProfile(prev => {
      const next = { ...prev, score: 100 };
      if (user) updateUserScore(user.uid, 100);
      return next;
    });
    const log: ScoreLog = {
      id: `log-reset-${Date.now()}`,
      delta: 0,
      reason: 'Score Reset to Baseline (100 pts)',
      taskId: 'system',
      taskTitle: 'Discipline Baseline Re-established',
      scoreAfter: 100,
      timestamp: new Date().toISOString()
    };
    setScoreLogs(prev => [log, ...prev]);
  };

  // Auth Operations
  const signInGoogle = async () => {
    await loginWithGoogle();
  };

  const signInEmail = async (email: string, pass: string) => {
    await loginWithEmail(email, pass);
  };

  const signUpEmail = async (email: string, pass: string) => {
    await registerWithEmail(email, pass);
  };

  const signInGuest = async () => {
    await loginAnonymously();
  };

  const signOut = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <TaskContext.Provider
      value={{
        user,
        profile,
        tasks,
        scoreLogs,
        activeSprint,
        sprintReports,
        isLoading,
        scoreNotification,
        isSprintReportModalOpen,
        setIsSprintReportModalOpen,
        taskToEnd,
        setTaskToEnd,
        addTask,
        addMultipleTasks,
        completeTaskWithSubmission,
        deleteTask,
        updateNotes,
        resetScoreToBaseline,
        startSprint,
        cancelSprint,
        submitSprintReport,
        signInGoogle,
        signInEmail,
        signUpEmail,
        signInGuest,
        signOut
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return ctx;
};
