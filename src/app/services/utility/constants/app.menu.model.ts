import { MenuItem } from 'primeng/api';

export interface AppMenuItem extends MenuItem {
  routeName?: string;
  items?: AppMenuItem[];
}

export const MENU_ITEMS: AppMenuItem[] = [
  { label: 'menu.dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
  { label: 'menu.myCv', icon: 'pi pi-file', routerLink: '/view-cv' },
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
      { label: 'menu.session', icon: 'pi pi-desktop', routerLink: '/sessions', routeName: 'session-list' }
    ]
  }
];

export const ACCOUNT_MENU_ITEMS: AppMenuItem[] = [
  { label: 'account.myProfile', icon: 'pi pi-user', routerLink: '/profile' },
  { label: 'account.changePassword', icon: 'pi pi-lock', routerLink: '/profile/change-password' }
];
