import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qwenton.tasks',
  appName: 'ChronoTask',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#3B82F6',
      sound: 'beep.wav'
    }
  }
};

export default config;
