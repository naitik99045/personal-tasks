export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatus = 'active' | 'completed' | 'missed';

export interface TaskSubmission {
  deliverableSummary: string; // What the operative created / completed
  outputUrl?: string; // Optional link to deliverable, GitHub, Figma, doc
  reflectionNotes?: string; // Optional execution notes
  completedAt: string; // ISO String
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  priority: TaskPriority;
  deadline: string; // ISO String
  createdAt: string; // ISO String
  status: TaskStatus;
  penaltyApplied: boolean;
  rewardApplied: boolean;
  completedAt?: string;
  submission?: TaskSubmission; // End-task proof-of-work response
}

export interface ScoreLog {
  id: string;
  delta: number; // +10, -20, or +50
  reason: string;
  taskId: string;
  taskTitle: string;
  scoreAfter: number;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL?: string | null;
  isAnonymous: boolean;
  score: number;
  tasksCompleted: number;
  tasksMissed: number;
  createdAt: string;
}

export type ScoreTier = 'Master' | 'Punctual' | 'At Risk' | 'Critical';

export function getScoreTier(score: number): { tier: ScoreTier; label: string; colorClass: string } {
  if (score >= 150) {
    return { tier: 'Master', label: 'Master (Elite Discipline)', colorClass: 'badge-brand' };
  } else if (score >= 100) {
    return { tier: 'Punctual', label: 'Punctual (On Track)', colorClass: 'badge-success' };
  } else if (score >= 50) {
    return { tier: 'At Risk', label: 'At Risk (Action Needed)', colorClass: 'badge-warning' };
  } else {
    return { tier: 'Critical', label: 'Critical (High Penalty)', colorClass: 'badge-penalty' };
  }
}

// Multi-Day Sprint & Report Types
export interface Sprint {
  id: string;
  name: string;
  durationDays: number;
  startDate: string; // ISO
  endDate: string; // ISO
  status: 'active' | 'ended' | 'reported';
  startCompletedCount: number;
  startMissedCount: number;
  startScore: number;
}

export interface SprintReport {
  id: string;
  sprintId: string;
  sprintName: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  submittedAt: string;
  tasksDoneCount: number;
  tasksMissedCount: number;
  completionRate: number; // percentage
  netScoreChange: number;
  userNotes: string;
  bonusAwarded: number;
}
