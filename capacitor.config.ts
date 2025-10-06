import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4e30269be8cd42448e17798b41f036fd',
  appName: 'kid-logo-explorer',
  webDir: 'dist',
  server: {
    url: 'https://4e30269b-e8cd-4244-8e17-798b41f036fd.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#60A5FA",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    }
  }
};

export default config;