# E-Recruitment Web

A web client for the e-recruitment platform — built with Angular 17 and PrimeNG, covering the public job portal, candidate self-service, recruiter/job-posting workflows, and role-based administration, with JWT + Google authentication and English/Bengali localization.

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

- **Public job portal** — unauthenticated home page, job search/listing, and job detail view; recruiter sign-up (`/register/recruiter`) for companies wanting to post jobs
- **Authentication** — email/password login, Google Sign-In, OTP-verified sign-up, and OTP-based forgot/change/set-password flows
- **Candidate self-service** (`/my/...`) — CV-style profile view/edit, submitted applications with detail view, saved jobs, and job alerts
- **Recruiting** — company CRUD, job posting CRUD, application management (review candidate applications against a posting), and a recruiter-application queue for approving companies that registered to recruit
- **Analytics dashboard** — permission-gated reporting view over recruiting activity
- **Role-based administration** — CRUD for users, roles, permissions, and user groups, with drag-and-drop assignment of permissions to roles and roles to users/groups
- **System configuration** — centralized view/edit of backend system config entries and the global password policy
- **Exception log viewer** — searchable, paginated view of server-side exception logs for diagnostics
- **Session management** — searchable, paginated view of user login sessions with detail view
- **Audit log viewer** — searchable, paginated view of audit trail entries with detail view
- **Archive configuration** — CRUD for scheduled data-archiving rules (source table, age/date condition, optional extra WHERE clause, schedule), with an on-demand "Archive Now" trigger and a viewer for already-archived rows
- **User profile** — self-service profile view/edit with avatar upload
- **Internationalization** — full English and Bengali (বাংলা) translations with a live language switcher
- **Route guards** — authenticated areas are protected by `AuthGuard`, and admin/recruiting routes additionally by a permission-aware `PermissionGuard` (checked against each route's `data.routeName`) that redirects to `/access-denied` when the signed-in user lacks the route's permission; JWT is attached via an HTTP interceptor

## Tech Stack

| Layer            | Technology |
|-------------------|------------|
| Framework          | [Angular 17](https://angular.io) (NgModule-based, `@angular-devkit/build-angular:browser` builder) |
| UI components       | [PrimeNG 17](https://primeng.org) (Lara Light Blue theme) |
| Layout & icons      | PrimeFlex (utility classes) + PrimeIcons |
| Localization        | [ngx-translate](https://github.com/ngx-translate/core) (English + Bengali) |
| Rich text editing    | [Quill](https://quilljs.com/) (via PrimeNG's `p-editor`, e.g. job posting descriptions) |
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
│   ├── home/                      Public landing page (unauthenticated)
│   ├── dashboard/                 Landing page after login
│   ├── job-portal/                Public job search/listing and job detail view (search / view)
│   ├── candidate/
│   │   ├── profile/               Candidate CV-style profile (form / view)
│   │   ├── applications/          List of the signed-in candidate's submitted applications
│   │   ├── application-detail/    Detail view of a single submitted application
│   │   ├── saved-jobs/            Jobs the candidate has bookmarked
│   │   └── job-alerts/            Candidate's saved search alerts
│   ├── company/                   Recruiting: company CRUD (search / form / view)
│   ├── job-posting/               Recruiting: job posting CRUD (search / form / view)
│   ├── application-management/    Recruiting: review applications received for a job posting (search / view)
│   ├── recruiter-application/     Recruiting: approve/reject companies that self-registered to recruit (register / search / view)
│   ├── analytics/                 Permission-gated analytics/reporting dashboard
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
│   ├── candidate-profile/, application/, saved-job/, job-alert/,
│   │   company/, company-type/, job-posting/, recruiter-application/,
│   │   analytics/, interview/, offer/, onboarding/  Recruiting/candidate feature API services + domain models
│   ├── role/, permission/, user-group/,
│   │   system-config/, password-policy/, exception-log/,
│   │   session/, audit-log/, archive-config/  Admin feature API services + domain models
│   └── utility/
│       ├── security/               AuthService (login/session state), AuthGuard, PermissionGuard
│       ├── interceptors/           Auth + loading HTTP interceptors
│       ├── constants/              api.urls.ts (backend endpoint paths), app.menu.model.ts (sidebar menu definition)
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
| `/`                         | `HomeComponent`                | —            |
| `/login`                    | `LoginComponent`               | —            |
| `/signup`                   | `RegistrationFormComponent`    | —            |
| `/register/recruiter`       | `RecruiterApplicationRegisterComponent` | —   |
| `/forgot-password`          | `ForgotPasswordComponent`      | —            |
| `/set-password`             | `SetPasswordComponent`         | —            |
| `/dashboard`                | `DashboardComponent`           | `AuthGuard`  |
| `/access-denied`            | `AccessDeniedComponent`        | —            |
| `/jobs`                     | `JobPortalSearchComponent`     | —            |
| `/jobs/:id`                 | `JobPortalViewComponent`       | —            |
| `/my/profile`               | `CandidateProfileViewComponent` | `AuthGuard` |
| `/my/profile/edit`          | `CandidateProfileFormComponent` | `AuthGuard` |
| `/my/applications`          | `CandidateApplicationsComponent` | `AuthGuard` |
| `/my/applications/:id`      | `CandidateApplicationDetailComponent` | `AuthGuard` |
| `/my/saved-jobs`            | `CandidateSavedJobsComponent`  | `AuthGuard`  |
| `/my/job-alerts`            | `CandidateJobAlertsComponent`  | `AuthGuard`  |
| `/analytics`                | `AnalyticsDashboardComponent`  | `AuthGuard`, `PermissionGuard` (`analytics-list`) |
| `/recruiter-applications`   | `RecruiterApplicationSearchComponent` | `AuthGuard`, `PermissionGuard` (`recruiter-application-list`) |
| `/recruiter-applications/:id` | `RecruiterApplicationViewComponent` | `AuthGuard`, `PermissionGuard` (`recruiter-application-list`) |
| `/companies`                | `CompanySearchComponent`       | `AuthGuard`, `PermissionGuard` (`company-list`) |
| `/companies/create`         | `CompanyFormComponent`         | `AuthGuard`, `PermissionGuard` (`company-manage`) |
| `/companies/:id/edit`       | `CompanyFormComponent`         | `AuthGuard`, `PermissionGuard` (`company-manage`) |
| `/companies/:id`            | `CompanyViewComponent`         | `AuthGuard`, `PermissionGuard` (`company-list`) |
| `/job-postings`             | `JobPostingSearchComponent`    | `AuthGuard`, `PermissionGuard` (`job-circular-list`) |
| `/job-postings/create`      | `JobPostingFormComponent`      | `AuthGuard`, `PermissionGuard` (`job-circular-manage`) |
| `/job-postings/:id/edit`    | `JobPostingFormComponent`      | `AuthGuard`, `PermissionGuard` (`job-circular-manage`) |
| `/job-postings/:id`         | `JobPostingViewComponent`      | `AuthGuard`, `PermissionGuard` (`job-circular-list`) |
| `/application-management`   | `ApplicationManagementSearchComponent` | `AuthGuard`, `PermissionGuard` (`job-circular-manage`) |
| `/application-management/:id` | `ApplicationManagementViewComponent` | `AuthGuard`, `PermissionGuard` (`job-circular-manage`) |
| `/profile`                  | `ProfileViewComponent`         | `AuthGuard`  |
| `/profile/edit`             | `ProfileEditComponent`         | `AuthGuard`  |
| `/profile/change-password`  | `ChangePasswordComponent`      | `AuthGuard`  |
| `/roles`                    | `RoleSearchComponent`          | `AuthGuard`, `PermissionGuard` (`role-list`) |
| `/roles/create`             | `RoleFormComponent`            | `AuthGuard`, `PermissionGuard` (`role-manage`) |
| `/roles/:id/edit`           | `RoleFormComponent`            | `AuthGuard`, `PermissionGuard` (`role-manage`) |
| `/roles/:id`                | `RoleViewComponent`            | `AuthGuard`, `PermissionGuard` (`role-list`) |
| `/users`                    | `UserSearchComponent`          | `AuthGuard`, `PermissionGuard` (`user-list`) |
| `/users/create`             | `UserFormComponent`            | `AuthGuard`, `PermissionGuard` (`user-manage`) |
| `/users/:id/edit`           | `UserFormComponent`            | `AuthGuard`, `PermissionGuard` (`user-manage`) |
| `/users/:id`                | `UserViewComponent`            | `AuthGuard`, `PermissionGuard` (`user-list`) |
| `/user-groups`              | `UserGroupSearchComponent`     | `AuthGuard`, `PermissionGuard` (`user-group-list`) |
| `/user-groups/create`       | `UserGroupFormComponent`       | `AuthGuard`, `PermissionGuard` (`user-group-manage`) |
| `/user-groups/:id/edit`     | `UserGroupFormComponent`       | `AuthGuard`, `PermissionGuard` (`user-group-manage`) |
| `/user-groups/:id`          | `UserGroupViewComponent`       | `AuthGuard`, `PermissionGuard` (`user-group-list`) |
| `/permissions`              | `PermissionSearchComponent`    | `AuthGuard`, `PermissionGuard` (`permission-list`) |
| `/permissions/create`       | `PermissionFormComponent`      | `AuthGuard`, `PermissionGuard` (`permission-manage`) |
| `/permissions/:id/edit`     | `PermissionFormComponent`      | `AuthGuard`, `PermissionGuard` (`permission-manage`) |
| `/permissions/:id`          | `PermissionViewComponent`      | `AuthGuard`, `PermissionGuard` (`permission-list`) |
| `/system-configs`           | `SystemConfigSearchComponent`  | `AuthGuard`, `PermissionGuard` (`system-config-list`) |
| `/system-configs/:id/edit`  | `SystemConfigFormComponent`    | `AuthGuard`, `PermissionGuard` (`system-config-manage`) |
| `/system-configs/:id`       | `SystemConfigViewComponent`    | `AuthGuard`, `PermissionGuard` (`system-config-list`) |
| `/password-policy`          | `PasswordPolicyViewComponent`  | `AuthGuard`, `PermissionGuard` (`password-policy-list`) |
| `/password-policy/edit`     | `PasswordPolicyFormComponent`  | `AuthGuard`, `PermissionGuard` (`password-policy-manage`) |
| `/exception-logs`           | `ExceptionLogSearchComponent`  | `AuthGuard`, `PermissionGuard` (`exception-log-list`) |
| `/exception-logs/:id`       | `ExceptionLogViewComponent`    | `AuthGuard`, `PermissionGuard` (`exception-log-list`) |
| `/sessions`                 | `SessionSearchComponent`       | `AuthGuard`, `PermissionGuard` (`session-list`) |
| `/sessions/:id`             | `SessionViewComponent`         | `AuthGuard`, `PermissionGuard` (`session-list`) |
| `/audit-logs`               | `AuditLogSearchComponent`      | `AuthGuard`, `PermissionGuard` (`audit-log-list`) |
| `/audit-logs/:id`           | `AuditLogViewComponent`        | `AuthGuard`, `PermissionGuard` (`audit-log-list`) |
| `/archive-configs`          | `ArchiveConfigSearchComponent` | `AuthGuard`, `PermissionGuard` (`archive-config-list`) |
| `/archive-configs/create`   | `ArchiveConfigFormComponent`   | `AuthGuard`, `PermissionGuard` (`archive-config-manage`) |
| `/archive-configs/:id/edit` | `ArchiveConfigFormComponent`   | `AuthGuard`, `PermissionGuard` (`archive-config-manage`) |
| `/archive-configs/:id/archived-data` | `ArchiveConfigArchivedDataComponent` | `AuthGuard`, `PermissionGuard` (`archive-config-list`) |
| `/archive-configs/:id`      | `ArchiveConfigViewComponent`   | `AuthGuard`, `PermissionGuard` (`archive-config-list`) |
| `**`                        | redirects to `/login`          | —            |

</details>

## Testing

```bash
npm test
```

Runs the unit test suite via [Karma](https://karma-runner.github.io) / Jasmine.

---

For Angular CLI usage, run `ng help` or see the [Angular CLI reference](https://angular.dev/cli). For component usage, see the [PrimeNG documentation](https://primeng.org/). For translation usage, see the [ngx-translate documentation](https://github.com/ngx-translate/core).

