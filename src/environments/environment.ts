<<<<<<< HEAD
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

=======
>>>>>>> e-commerce
import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
<<<<<<< HEAD
  production: false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
=======
  production: false,
  apiUrl: 'http://localhost:8085/api',
  openRouterApiKey: 'YOUR_OPENROUTER_API_KEY_HERE'
};
>>>>>>> e-commerce
