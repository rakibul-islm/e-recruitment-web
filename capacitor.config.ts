import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bd.erecruitment',
  appName: 'E-Recruitment',
  webDir: 'dist/e-recruitment-web',
  plugins: {
    StatusBar: {
      backgroundColor: '#032967',
      style: 'DARK',
      overlaysWebView: false
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '252725521135-l7c05a4382ja3udgtqpkmv7tm2eu1hnk.apps.googleusercontent.com',
      forceCodeForRefreshToken: false
    }
  }
};

export default config;
