// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: 'http://localhost:8041/e-recruitment/',
  // Must match the backend's `google.client-id` (GOOGLE_CLIENT_ID env var) and have this
  // app's origin (e.g. http://localhost:4200) registered as an Authorized JavaScript origin
  // for this OAuth client in Google Cloud Console.
  googleClientId: '79115464279-kffbqr7i3voeuhd10t550q209ai1omeb.apps.googleusercontent.com'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
