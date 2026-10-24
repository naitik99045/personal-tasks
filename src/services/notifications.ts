import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import type { Task, Sprint } from '../types';

let audioContext: AudioContext | null = null;
const CHANNEL_ID = 'chronotask_alarms';

function getAudioContext(): AudioContext {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioCtx();
  }
  return audioContext;
}

// Initialize notification channels and permissions for Android & Web
export async function initNotificationEngine(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      // 1. Request Android runtime notification permission
      const perm = await LocalNotifications.requestPermissions();

      // 2. Create High-Priority Notification Channel for Android 8.0+
      await LocalNotifications.createChannel({
        id: CHANNEL_ID,
        name: 'ChronoTask Deadline Alarms',
        description: 'High-priority notifications for task timers and multi-day sprint reports',
        importance: 5, // MAX IMPORTANCE (Heads-up banner, sound, vibration)
        visibility: 1, // Public on lock screen
        vibration: true,
        lights: true,
        lightColor: '#2563EB'
      });

      return perm.display === 'granted';
    } catch (err) {
      console.warn('Native notification init error:', err);
      return false;
    }
  } else if ('Notification' in window) {
    try {
      if (Notification.permission === 'default') {
        const result = await Notification.requestPermission();
        return result === 'granted';
      }
      return Notification.permission === 'granted';
    } catch (err) {
      console.warn('Web notification init error:', err);
      return false;
    }
  }
  return false;
}

// Synthesized Apple-like audio feedback
export function playChime(type: 'success' | 'penalty' | 'tick' | 'alarm'): void {
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
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'penalty' || type === 'alarm') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(240, now + 0.15);
      osc.frequency.setValueAtTime(160, now + 0.3);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.55);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch {
    // Audio Context requires initial user tap
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
      // Ignore
    }
  } else if ('vibrate' in navigator) {
    if (type === 'success') navigator.vibrate([60, 50, 100]);
    else if (type === 'penalty') navigator.vibrate([200, 100, 300]);
    else navigator.vibrate(25);
  }
}

// Schedule Task Deadline Alarm
export async function scheduleTaskDeadlineAlarm(task: Task): Promise<void> {
  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();

  if (diffMs <= 0) return;

  const notifId = Math.abs(task.id.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)) % 100000;

  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `⏰ Task Timer Expired: ${task.title}`,
            body: `Your deadline has arrived! Submit your deliverable now or lose 20 discipline points.`,
            id: notifId,
            schedule: { at: deadlineDate },
            channelId: CHANNEL_ID,
            sound: 'beep.wav',
            actionTypeId: '',
            extra: { taskId: task.id }
          }
        ]
      });
    } catch (err) {
      console.warn('Native task notification schedule error:', err);
    }
  } else if ('Notification' in window && Notification.permission === 'granted') {
    // Web Fallback Timer
    setTimeout(() => {
      new Notification(`⏰ Task Timer Expired: ${task.title}`, {
        body: 'Your deadline has arrived! Submit your deliverable now or lose 20 points.',
        icon: '/favicon.ico'
      });
      playChime('alarm');
    }, Math.min(diffMs, 2147483647));
  }
}

export async function cancelTaskDeadlineAlarm(taskId: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      const notifId = Math.abs(taskId.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)) % 100000;
      await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
    } catch (err) {
      console.warn('Cancel task notification error:', err);
    }
  }
}

// Schedule Multi-Day Sprint Expiration Alarm (3, 4, 5 days)
export async function scheduleSprintDeadlineAlarm(sprint: Sprint): Promise<void> {
  const endDate = new Date(sprint.endDate);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();

  if (diffMs <= 0) return;

  const notifId = 888000 + sprint.durationDays;

  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `⏰ ${sprint.durationDays}-Day Sprint Completed!`,
            body: `Your timer has ended! Submit your report on how many tasks you have done.`,
            id: notifId,
            schedule: { at: endDate },
            channelId: CHANNEL_ID,
            sound: 'beep.wav',
            actionTypeId: '',
            extra: { sprintId: sprint.id }
          }
        ]
      });
    } catch (err) {
      console.warn('Native sprint notification schedule error:', err);
    }
  } else if ('Notification' in window && Notification.permission === 'granted') {
    // Web Fallback Timer
    setTimeout(() => {
      new Notification(`⏰ ${sprint.durationDays}-Day Sprint Completed!`, {
        body: `Your timer has ended! Submit your report on how many tasks you have done.`,
        icon: '/favicon.ico'
      });
      playChime('alarm');
    }, Math.min(diffMs, 2147483647));
  }
}

export async function cancelSprintDeadlineAlarm(sprint: Sprint): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      const notifId = 888000 + sprint.durationDays;
      await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
    } catch (err) {
      console.warn('Cancel sprint notification error:', err);
    }
  }
}

// Instant Test Notification (Triggers in 5 seconds to verify system notifications)
export async function triggerTestNotification(): Promise<void> {
  await initNotificationEngine();
  const testDate = new Date(Date.now() + 5000); // 5 seconds from now

  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: '🔔 ChronoTask Notification Verified!',
            body: 'Your device receives deadline alerts and sprint timer notifications perfectly.',
            id: 999999,
            schedule: { at: testDate },
            channelId: CHANNEL_ID,
            sound: 'beep.wav'
          }
        ]
      });
    } catch (err) {
      console.warn('Test notification error:', err);
    }
  } else if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      setTimeout(() => {
        new Notification('🔔 ChronoTask Notification Verified!', {
          body: 'Your device receives deadline alerts and sprint timer notifications perfectly.',
          icon: '/favicon.ico'
        });
        playChime('success');
      }, 5000);
    } else {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setTimeout(() => {
          new Notification('🔔 ChronoTask Notification Verified!', {
            body: 'Your device receives deadline alerts and sprint timer notifications perfectly.',
            icon: '/favicon.ico'
          });
          playChime('success');
        }, 5000);
      }
    }
  }
}
