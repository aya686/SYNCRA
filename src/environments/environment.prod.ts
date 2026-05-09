import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,

  // API principale
  apiUrl: 'http://localhost:8085/api',

  // Configuration mock API
  useMockDossierSanteApi: false,

  // OpenRouter API
  openRouterApiKey: 'YOUR_OPENROUTER_API_KEY_HERE'
};