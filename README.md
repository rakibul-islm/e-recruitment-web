# E-Recruitment Web

A web client for the e-recruitment platform — built with Angular 17 and PrimeNG, with role-based administration, JWT + Google authentication, and English/Bengali localization.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Internationalization (i18n)](#internationalization-i18n)
- [Project Structure](#project-structure)
- [Routes](#routes)
- [Testing](#testing)

## Features

- **Authentication** — email/password login, Google Sign-In, OTP-verified sign-up, and OTP-based forgot/change/set-password flows
- **Role-based administration** — CRUD for users, roles, permissions, and user groups, with drag-and-drop assignment of permissions to roles and roles to users/groups
- **System configuration** — centralized view/edit of backend system config entries and the global password policy
- **Exception log viewer** — searchable, paginated view of server-side exception logs for diagnostics
- **Session management** — searchable, paginated view of user login sessions with detail view
- **Audit log viewer** — searchable, paginated view of audit trail entries with detail view
- **Archive configuration** — CRUD for scheduled data-archiving rules (source table, age/date condition, optional extra WHERE clause, schedule), with an on-demand "Archive Now" trigger and a viewer for already-archived rows
- **User profile** — self-service profile view/edit with avatar upload
- **Internationalization** — full English and Bengali (বাংলা) translations with a live language switcher
- **Route guards** — authenticated areas are protected by `AuthGuard`, and admin routes additionally by a permission-aware `PermissionGuard` that redirects to `/access-denied` when the signed-in user lacks the route's permission; JWT is attached via an HTTP interceptor

## Tech Stack

| Layer            | Technology |
|-------------------|------------|
| Framework          | [Angular 17](https://angular.io) (NgModule-based, `@angular-devkit/build-angular:browser` builder) |
| UI components       | [PrimeNG 17](https://primeng.org) (Lara Light Blue theme) |
| Layout & icons      | PrimeFlex (utility classes) + PrimeIcons |
| Localization        | [ngx-translate](https://github.com/ngx-translate/core) (English + Bengali) |
| Auth                | JWT (custom backend) + Google Identity Services |
| Reactive state       | RxJS |
| Language            | TypeScript 5.4 |

Styling is a mix of PrimeNG components, PrimeFlex utility classes, and small component-scoped `.scss` files for anything the two don't cover (background images, brand colors, the glassmorphism auth cards, avatar sizing, etc.). There is no Tailwind/PostCSS in this project.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS) and npm
- [Angular CLI](https://angular.dev/tools/cli) (`npm install -g @angular/cli`) — optional, `npx ng` also works without a global install

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:4200)
npm start
```

Before running the app, point it at your backend and Google OAuth client — see [Environment Variables](#environment-variables).

## Available Scripts

| Script               | Description |
|-----------------------|-------------|
| `npm start`            | Runs `ng serve` — dev server with live reload at `http://localhost:4200` |
| `npm run build`        | Runs `ng build` — build artifacts are output to `dist/e-recruitment-web/` |
| `npm run build:prod`   | Substitutes `API_BASE_URL` / `GOOGLE_CLIENT_ID` into `environment.prod.ts`, then runs `ng build --configuration production` |
| `npm run watch`        | Runs `ng build --watch --configuration development` |
| `npm test`             | Runs unit tests via [Karma](https://karma-runner.github.io) |

## Environment Variables

**Development** — edit `src/environments/environment.ts` directly:

```ts
export const environment = {
  production: false,
  baseUrl: 'http://localhost:8041/e-recruitment/',
  googleClientId: '<your-google-oauth-client-id>'
};
```

**Production** (`npm run build:prod`) — `src/environments/environment.prod.ts` ships with `__API_BASE_URL__` / `__GOOGLE_CLIENT_ID__` placeholders that are substituted from these shell environment variables at build time:

| Variable          | Description |
|--------------------|-------------|
| `API_BASE_URL`      | Base URL of the e-recruitment backend API |
| `GOOGLE_CLIENT_ID`  | OAuth 2.0 client ID used for Google Sign-In |

## Internationalization (i18n)

The app is localized with [ngx-translate](https://github.com/ngx-translate/core). Translations are loaded at runtime from JSON files in `src/assets/i18n/`:

| File       | Language |
|-------------|----------|
| `en.json`   | English (default) |
| `bn.json`   | Bengali (বাংলা) |

`LanguageService` (`src/app/services/utility/language.service.ts`) initializes the active language on app start, persists the user's choice in `localStorage`, and powers the language switcher in the header's account menu (globe icon).

**Adding a language:**

1. Add a new `<lang-code>.json` file to `src/assets/i18n/`, mirroring the key structure of `en.json`.
2. Register the language (code + display label) in `SUPPORTED_LANGUAGES` in `language.service.ts`.

**Adding new UI text:** add the key to *both* `en.json` and `bn.json` so they stay in sync. Use the `translate` pipe (`{{ 'some.key' | translate }}`) in templates, and `TranslateService.instant('some.key')` for messages built up in TypeScript (toasts, confirm dialogs, etc.). Common, reused words (Search, Save, Delete, N/A, ...) live under the `common` namespace; feature-specific text lives under a namespace per module (`role`, `permission`, `user`, `userGroup`, `systemConfig`, `passwordPolicy`, `exceptionLog`, `password`, `profile`, ...).

## Project Structure

```
src/app/
├── components/
│   ├── shared/
│   │   ├── app-header/            Top navigation bar (PrimeNG Menubar + Avatar + Menu + language switcher)
│   │   ├── page-header/           Reusable page title + action-buttons bar (collapses into a 3-dot menu on mobile)
│   │   └── access-denied/         Shown when PermissionGuard blocks a route
│   ├── dashboard/                 Landing page after login
│   ├── user/
│   │   ├── login/                 Sign-in form (email/password + Google Sign-In)
│   │   ├── registration/          Sign-up form with OTP email verification
│   │   ├── password/              forgot-password / change-password / set-password (OTP-based) flows
│   │   ├── profile/                view / edit the signed-in user's own profile
│   │   └── management/            Admin CRUD for user accounts (search / form / view)
│   ├── role/                      Admin CRUD for roles, with permission assignment
│   ├── permission/                Admin CRUD for permissions
│   ├── user-group/                Admin CRUD for user groups, with role assignment
│   ├── system-config/             Admin search/view/edit for system configuration entries
│   ├── password-policy/           Admin view/edit for the global password policy
│   ├── exception-log/             Admin search/view for server-side exception logs
│   ├── session/                   Admin search/view for user login sessions
│   ├── audit-log/                 Admin search/view for audit trail entries
│   ├── archive-config/            Admin CRUD for scheduled data-archiving rules (search / form / view / archived-data)
│   └── base.component.ts          Shared base class (subscription cleanup, search/pagination helpers)
├── directives/
│   ├── required.field.directive.ts
│   ├── permission.disable.directive.ts  Disables the host control/element when the user lacks the given route permission
│   ├── permission.hide.directive.ts     Structural directive that hides its template when the user lacks the given route permission
│   └── translate.options.directive.ts   Live-translates `p-dropdown[optionLabel="label"]` option lists on language change
├── services/
│   ├── user/                      User/profile API service + domain models
│   ├── role/, permission/, user-group/,
│   │   system-config/, password-policy/, exception-log/,
│   │   session/, audit-log/, archive-config/  Feature API services + domain models
│   └── utility/
│       ├── security/               AuthService (login/session state), AuthGuard, PermissionGuard
│       ├── interceptors/           Auth + loading HTTP interceptors
│       ├── language.service.ts     ngx-translate init + language switching
│       ├── notification.service.ts        Wrapper around PrimeNG's MessageService (<p-toast>)
│       └── common.confirm.dialog.service.ts   Wrapper around PrimeNG's ConfirmationService
├── app.routing.module.ts          Route definitions
└── app.module.ts                  Root NgModule (PrimeNG + ngx-translate modules imported here)

src/assets/i18n/                   Translation files (en.json, bn.json)
```

## Routes

<details>
<summary>Full route table (click to expand)</summary>

| Path                       | Component                     | Guard        |
|-----------------------------|--------------------------------|--------------|
| `/login`                    | `LoginComponent`               | —            |
| `/signup`                   | `RegistrationFormComponent`    | —            |
| `/forgot-password`          | `ForgotPasswordComponent`      | —            |
| `/set-password`             | `SetPasswordComponent`         | —            |
| `/dashboard`                | `DashboardComponent`           | —            |
| `/access-denied`            | `AccessDeniedComponent`        | —            |
| `/profile`                  | `ProfileViewComponent`         | `AuthGuard`  |
| `/profile/edit`             | `ProfileEditComponent`         | `AuthGuard`  |
| `/profile/change-password`  | `ChangePasswordComponent`      | `AuthGuard`  |
| `/roles`                    | `RoleSearchComponent`          | `AuthGuard`, `PermissionGuard` |
| `/roles/create`             | `RoleFormComponent`            | `AuthGuard`, `PermissionGuard` |
| `/roles/:id/edit`           | `RoleFormComponent`            | `AuthGuard`, `PermissionGuard` |
| `/roles/:id`                | `RoleViewComponent`            | `AuthGuard`, `PermissionGuard` |
| `/users`                    | `UserSearchComponent`          | `AuthGuard`, `PermissionGuard` |
| `/users/create`             | `UserFormComponent`            | `AuthGuard`, `PermissionGuard` |
| `/users/:id/edit`           | `UserFormComponent`            | `AuthGuard`, `PermissionGuard` |
| `/users/:id`                | `UserViewComponent`            | `AuthGuard`, `PermissionGuard` |
| `/user-groups`              | `UserGroupSearchComponent`     | `AuthGuard`, `PermissionGuard` |
| `/user-groups/create`       | `UserGroupFormComponent`       | `AuthGuard`, `PermissionGuard` |
| `/user-groups/:id/edit`     | `UserGroupFormComponent`       | `AuthGuard`, `PermissionGuard` |
| `/user-groups/:id`          | `UserGroupViewComponent`       | `AuthGuard`, `PermissionGuard` |
| `/permissions`              | `PermissionSearchComponent`    | `AuthGuard`, `PermissionGuard` |
| `/permissions/create`       | `PermissionFormComponent`      | `AuthGuard`, `PermissionGuard` |
| `/permissions/:id/edit`     | `PermissionFormComponent`      | `AuthGuard`, `PermissionGuard` |
| `/permissions/:id`          | `PermissionViewComponent`      | `AuthGuard`, `PermissionGuard` |
| `/system-configs`           | `SystemConfigSearchComponent`  | `AuthGuard`, `PermissionGuard` |
| `/system-configs/:id/edit`  | `SystemConfigFormComponent`    | `AuthGuard`, `PermissionGuard` |
| `/system-configs/:id`       | `SystemConfigViewComponent`    | `AuthGuard`, `PermissionGuard` |
| `/password-policy`          | `PasswordPolicyViewComponent`  | `AuthGuard`, `PermissionGuard` |
| `/password-policy/edit`     | `PasswordPolicyFormComponent`  | `AuthGuard`, `PermissionGuard` |
| `/exception-logs`           | `ExceptionLogSearchComponent`  | `AuthGuard`, `PermissionGuard` |
| `/exception-logs/:id`       | `ExceptionLogViewComponent`    | `AuthGuard`, `PermissionGuard` |
| `/sessions`                 | `SessionSearchComponent`       | `AuthGuard`, `PermissionGuard` |
| `/sessions/:id`             | `SessionViewComponent`         | `AuthGuard`, `PermissionGuard` |
| `/audit-logs`               | `AuditLogSearchComponent`      | `AuthGuard`, `PermissionGuard` |
| `/audit-logs/:id`           | `AuditLogViewComponent`        | `AuthGuard`, `PermissionGuard` |
| `/archive-configs`          | `ArchiveConfigSearchComponent` | `AuthGuard`, `PermissionGuard` |
| `/archive-configs/create`   | `ArchiveConfigFormComponent`   | `AuthGuard`, `PermissionGuard` |
| `/archive-configs/:id/edit` | `ArchiveConfigFormComponent`   | `AuthGuard`, `PermissionGuard` |
| `/archive-configs/:id/archived-data` | `ArchiveConfigArchivedDataComponent` | `AuthGuard`, `PermissionGuard` |
| `/archive-configs/:id`      | `ArchiveConfigViewComponent`   | `AuthGuard`, `PermissionGuard` |
| `**`                        | redirects to `/login`          | —            |

</details>

## Testing

```bash
npm test
```

Runs the unit test suite via [Karma](https://karma-runner.github.io) / Jasmine.

---

For Angular CLI usage, run `ng help` or see the [Angular CLI reference](https://angular.dev/cli). For component usage, see the [PrimeNG documentation](https://primeng.org/). For translation usage, see the [ngx-translate documentation](https://github.com/ngx-translate/core).

