import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import type { Task, Sprint } from '../types';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioCtx();
  }
  return audioContext;
}

// Synthesized Apple-like audio feedback
export function playChime(type: 'success' | 'penalty' | 'tick'): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'success') {
      // Pleasant Major Triad Chime (+10 pts)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'penalty') {
      // Low descending warning chime (-20 pts)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.4);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else {
      // Subtle ticking tap
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch (err) {
    // Audio context may require initial user gesture
  }
}

// Android Haptic Vibration
export async function triggerHaptic(type: 'success' | 'penalty' | 'tap'): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      if (type === 'success') {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (type === 'penalty') {
        await Haptics.notification({ type: NotificationType.Error });
      } else {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    } catch {
      // Fallback
    }
  } else if ('vibrate' in navigator) {
    if (type === 'success') navigator.vibrate([60, 50, 100]);
    else if (type === 'penalty') navigator.vibrate([200, 100, 300]);
    else navigator.vibrate(25);
  }
}

// Android Local Notification for Clock Alarms
export async function scheduleTaskDeadlineAlarm(task: Task): Promise<void> {
  const deadlineDate = new Date(task.deadline);
  const now = new Date();

  if (deadlineDate <= now) return;

  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.requestPermissions();
      // Generate unique positive 32-bit int ID
      const notifId = Math.abs(task.id.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)) % 100000;
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `⏰ Deadline Alarm: ${task.title}`,
            body: `Your task timer has expired! Complete it now or lose 20 discipline points.`,
            id: notifId,
            schedule: { at: deadlineDate },
            sound: 'beep.wav',
            actionTypeId: '',
            extra: { taskId: task.id }
          }
        ]
      });
    } catch (err) {
      console.warn('Failed to schedule local notification:', err);
    }
  }
}

export async function cancelTaskDeadlineAlarm(taskId: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      const notifId = Math.abs(taskId.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)) % 100000;
      await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
    } catch (err) {
      console.warn('Failed to cancel notification:', err);
    }
  }
}

// Multi-Day Sprint Expiration Alarm
export async function scheduleSprintDeadlineAlarm(sprint: Sprint): Promise<void> {
  const endDate = new Date(sprint.endDate);
  const now = new Date();

  if (endDate <= now) return;

  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.requestPermissions();
      const notifId = 888000 + sprint.durationDays;
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `⏰ ${sprint.durationDays}-Day Sprint Completed!`,
            body: `Your timer has ended! Submit your report on how many tasks you have done.`,
            id: notifId,
            schedule: { at: endDate },
            sound: 'beep.wav',
            actionTypeId: '',
            extra: { sprintId: sprint.id }
          }
        ]
      });
    } catch (err) {
      console.warn('Failed to schedule sprint notification:', err);
    }
  }
}

export async function cancelSprintDeadlineAlarm(sprint: Sprint): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      const notifId = 888000 + sprint.durationDays;
      await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
    } catch (err) {
      console.warn('Failed to cancel sprint notification:', err);
    }
  }
}
