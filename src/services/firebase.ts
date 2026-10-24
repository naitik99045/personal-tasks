import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import type { Task, ScoreLog, UserProfile, Sprint, SprintReport } from '../types';

// Default Firebase Configuration matching project google-services.json
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA92kJnWtggKbkBO3d5zQgta57ABs-ezhg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "personal-tasks-5f879.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "personal-tasks-5f879",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "personal-tasks-5f879.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "380396481621",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:380396481621:android:1790a641c7aa457753f8dc"
};

// Initialize Firebase App Singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Authentication Helpers
export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user') {
      try {
        await signInWithRedirect(auth, provider);
        const res = await getRedirectResult(auth);
        if (res) return res.user;
      } catch (redirectErr) {
        throw redirectErr;
      }
    }
    throw err;
  }
}

export async function loginAnonymously(): Promise<User> {
  const userCredential = await signInAnonymously(auth);
  return userCredential.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

export async function registerWithEmail(email: string, pass: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}

// User Profile & Score Sync
export async function ensureUserProfile(user: User): Promise<UserProfile> {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    } else {
      const initialProfile: UserProfile = {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || (user.isAnonymous ? 'Guest Operative' : 'Chrono Pioneer'),
        photoURL: user.photoURL || null,
        isAnonymous: user.isAnonymous,
        score: 100, // PRD Baseline Score
        tasksCompleted: 0,
        tasksMissed: 0,
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, initialProfile);
      return initialProfile;
    }
  } catch (err) {
    console.warn('Firestore offline or restricted, using local memory profile:', err);
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || (user.isAnonymous ? 'Guest (Offline)' : 'User'),
      photoURL: user.photoURL || null,
      isAnonymous: user.isAnonymous,
      score: 100,
      tasksCompleted: 0,
      tasksMissed: 0,
      createdAt: new Date().toISOString()
    };
  }
}

export async function updateUserScore(uid: string, score: number, completedDelta = 0, missedDelta = 0): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      score,
      ...(completedDelta > 0 && { tasksCompleted: completedDelta }),
      ...(missedDelta > 0 && { tasksMissed: missedDelta })
    });
  } catch (err) {
    console.warn('Unable to sync score to cloud directly:', err);
  }
}

// Tasks Sync
export async function saveTaskToCloud(uid: string, task: Task): Promise<void> {
  try {
    const taskRef = doc(db, 'users', uid, 'tasks', task.id);
    await setDoc(taskRef, task);
  } catch (err) {
    console.warn('Task saved locally (Firestore offline):', err);
  }
}

export async function deleteTaskFromCloud(uid: string, taskId: string): Promise<void> {
  try {
    const taskRef = doc(db, 'users', uid, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (err) {
    console.warn('Failed to delete cloud task:', err);
  }
}

// Score Log Ledger
export async function logScoreChangeToCloud(uid: string, log: ScoreLog): Promise<void> {
  try {
    const logRef = doc(db, 'users', uid, 'history', log.id);
    await setDoc(logRef, log);
  } catch (err) {
    console.warn('Score log recorded locally:', err);
  }
}

// Multi-Day Sprint & Report Storage
export async function saveSprintStateToCloud(uid: string, sprint: Sprint | null): Promise<void> {
  try {
    const sprintRef = doc(db, 'users', uid, 'state', 'current_sprint');
    if (sprint) {
      await setDoc(sprintRef, sprint);
    } else {
      await deleteDoc(sprintRef);
    }
  } catch (err) {
    console.warn('Sprint state saved locally:', err);
  }
}

export async function saveSprintReportToCloud(uid: string, report: SprintReport): Promise<void> {
  try {
    const reportRef = doc(db, 'users', uid, 'sprint_reports', report.id);
    await setDoc(reportRef, report);
  } catch (err) {
    console.warn('Sprint report saved locally:', err);
  }
}
