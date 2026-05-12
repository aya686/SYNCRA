import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: false,

  gatewayUrl:  'http://localhost:8090',
  apiUrl:      'http://localhost:8090/ms5/api', // ← défaut pour les services qui l'utilisent

  hichemApi:   'http://localhost:8090/hichem/ms6/api',
  projetsApi:  'http://localhost:8090/projets/api',
  eventApi:    'http://localhost:8090/event/event_db/api',
  backendPiApi:'http://localhost:8090/backend/api',
  ms5Api:      'http://localhost:8090/ms5/api',
  gesUserApi:  'http://localhost:8090/gesuser/api',
  projetPiApi: 'http://localhost:8090/projetpi/api',
  ecommerceApi:'http://localhost:8090/ecommerce/api',

  useMockDossierSanteApi: true,
  openRouterApiKey: 'YOUR_OPENROUTER_API_KEY_HERE'
};