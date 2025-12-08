import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.andrewtheiss.usage',
  appName: 'UsageTracker',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
};

export default config;
