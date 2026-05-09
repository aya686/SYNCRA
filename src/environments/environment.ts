import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: false,
  apiUrl: 'http://localhost:8085/api',
  openRouterApiKey: 'YOUR_OPENROUTER_API_KEY_HERE'
};