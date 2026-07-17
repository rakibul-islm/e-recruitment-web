# E-Recruitment Web

A web client for the e-recruitment platform, built with [Angular](https://angular.io) 17 and [PrimeNG](https://primeng.org).

## Tech stack

- **Angular 17** (NgModule-based, `@angular-devkit/build-angular:browser` builder)
- **PrimeNG 17** for UI components, themed with **Lara Light Blue**
- **PrimeFlex** for layout/spacing utility classes and **PrimeIcons** for icons
- **ngx-toastr** for toast notifications
- **RxJS** / **TypeScript 5.4**

Styling is a mix of PrimeNG components, PrimeFlex utility classes, and small component-scoped `.scss` files for anything the two don't cover (background images, brand colors, the glassmorphism auth cards, avatar sizing, etc.). There is no Tailwind/PostCSS in this project.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS) and npm
- [Angular CLI](https://angular.dev/tools/cli) (`npm install -g @angular/cli`) — optional, `npx ng` also works without a global install

## Getting started

Install dependencies:

```bash
npm install
```

Configure the API base URL for your backend in `src/environments/environment.ts` (and `environment.prod.ts` for production builds):

```ts
export const environment = {
  production: false,
  baseUrl: 'http://localhost:8041/e-recruitment/'
};
```

## Development server

Run `ng serve` (or `npm start`) for a dev server. Navigate to `http://localhost:4200/`. The app reloads automatically on source changes.

## Build

Run `ng build` (or `npm run build`) to build the project. Build artifacts are stored in `dist/e-recruitment-web/`. Use `ng build --configuration production` for an optimized production build.

## Running unit tests

Run `ng test` (or `npm test`) to execute the unit tests via [Karma](https://karma-runner.github.io).

## Project structure

```
src/app/
├── components/
│   ├── app-header/           Top navigation bar (PrimeNG Menubar + Avatar + Menu)
│   ├── dashboard/            Landing page after login
│   └── user/
│       ├── login/            Sign-in form
│       ├── registration/     Sign-up form
│       └── profile/view/     Read-only profile view
├── services/
│   ├── user/                 User/profile API service + domain models
│   └── utility/
│       ├── security/         AuthService (login/session state) + AuthGuard
│       ├── interceptors/     HTTP auth interceptor
│       ├── notification.service.ts       ngx-toastr wrapper
│       └── common.confirm.dialog.service.ts   Wrapper around PrimeNG's ConfirmationService
├── app.routing.module.ts     Route definitions
└── app.module.ts             Root NgModule (PrimeNG modules imported here)
```

## Routes

| Path       | Component               | Guard      |
|------------|-------------------------|------------|
| `/login`   | `LoginComponent`        | —          |
| `/signup`  | `RegistrationFormComponent` | —      |
| `/dashboard` | `DashboardComponent`  | —          |
| `/profile` | `ProfileViewComponent`  | `AuthGuard` |

## Further help

To get more help on the Angular CLI use `ng help` or check the [Angular CLI reference](https://angular.dev/cli). For component usage, see the [PrimeNG documentation](https://primeng.org/).
