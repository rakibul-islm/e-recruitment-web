import { MenuItem } from 'primeng/api';

export interface AppMenuItem extends MenuItem {
  routeName?: string;
  authOnly?: boolean;
  items?: AppMenuItem[];
}

export const MENU_ITEMS: AppMenuItem[] = [
  { label: 'menu.dashboard', icon: 'pi pi-home', routerLink: '/dashboard', authOnly: true },
  { label: 'menu.findJobs', icon: 'pi pi-briefcase', routerLink: '/jobs' },
  {
    label: 'menu.candidate',
    icon: 'pi pi-user',
    authOnly: true,
    items: [
      { label: 'menu.myCv', icon: 'pi pi-file', routerLink: '/my/profile' },
      { label: 'menu.myApplications', icon: 'pi pi-send', routerLink: '/my/applications' },
      { label: 'menu.savedJobs', icon: 'pi pi-bookmark', routerLink: '/my/saved-jobs' },
      { label: 'menu.jobAlerts', icon: 'pi pi-bell', routerLink: '/my/job-alerts' }
    ]
  },
  {
    label: 'menu.recruiting',
    icon: 'pi pi-building',
    items: [
      { label: 'menu.companies', icon: 'pi pi-building', routerLink: '/companies', routeName: 'company-list' },
      { label: 'menu.jobPostings', icon: 'pi pi-briefcase', routerLink: '/job-postings', routeName: 'job-circular-list' },
      { label: 'menu.applicationManagement', icon: 'pi pi-users', routerLink: '/application-management', routeName: 'job-circular-manage' },
      { label: 'menu.analytics', icon: 'pi pi-chart-bar', routerLink: '/analytics', routeName: 'analytics-list' },
      { label: 'menu.recruiterApplications', icon: 'pi pi-user-plus', routerLink: '/recruiter-applications', routeName: 'recruiter-application-list' }
    ]
  },
  {
    label: 'menu.administration',
    icon: 'pi pi-cog',
    items: [
      { label: 'menu.user', icon: 'pi pi-users', routerLink: '/users', routeName: 'user-list' },
      { label: 'menu.userGroup', icon: 'pi pi-sitemap', routerLink: '/user-groups', routeName: 'user-group-list' },
      { label: 'menu.role', icon: 'pi pi-shield', routerLink: '/roles', routeName: 'role-list' },
      { label: 'menu.permission', icon: 'pi pi-key', routerLink: '/permissions', routeName: 'permission-list' },
      { label: 'menu.systemConfig', icon: 'pi pi-sliders-h', routerLink: '/system-configs', routeName: 'system-config-list' },
      { label: 'menu.passwordPolicy', icon: 'pi pi-lock', routerLink: '/password-policy', routeName: 'password-policy-list' },
      { label: 'menu.exceptionLog', icon: 'pi pi-exclamation-triangle', routerLink: '/exception-logs', routeName: 'exception-log-list' },
      { label: 'menu.session', icon: 'pi pi-desktop', routerLink: '/sessions', routeName: 'session-list' },
      { label: 'menu.auditLog', icon: 'pi pi-history', routerLink: '/audit-logs', routeName: 'audit-log-list' },
      { label: 'menu.archiveConfig', icon: 'pi pi-database', routerLink: '/archive-configs', routeName: 'archive-config-list' }
    ]
  }
];

export const ACCOUNT_MENU_ITEMS: AppMenuItem[] = [
  { label: 'account.myProfile', icon: 'pi pi-user', routerLink: '/profile' },
  { label: 'account.changePassword', icon: 'pi pi-lock', routerLink: '/profile/change-password' }
];
