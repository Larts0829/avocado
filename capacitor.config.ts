import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.avocado',
  appName: 'Snapocado',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen'
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 0,
      androidSplashResourceName: 'splash',
      backgroundColor: '#10b981',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;