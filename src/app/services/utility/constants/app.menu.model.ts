import { MenuItem } from 'primeng/api';

export interface AppMenuItem extends MenuItem {
  routeName?: string;
  items?: AppMenuItem[];
}

export const MENU_ITEMS: AppMenuItem[] = [
  { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
  { label: 'My CV', icon: 'pi pi-file', routerLink: '/view-cv' },
  {
    label: 'Administration',
    icon: 'pi pi-cog',
    items: [
      { label: 'User', icon: 'pi pi-users', routerLink: '/users', routeName: 'user-list' },
      { label: 'User Group', icon: 'pi pi-sitemap', routerLink: '/user-groups', routeName: 'user-group-list' },
      { label: 'Role', icon: 'pi pi-shield', routerLink: '/roles', routeName: 'role-list' },
      { label: 'Permission', icon: 'pi pi-key', routerLink: '/permissions', routeName: 'permission-list' },
      { label: 'System Config', icon: 'pi pi-sliders-h', routerLink: '/system-configs', routeName: 'system-config-list' }
    ]
  }
];

export const ACCOUNT_MENU_ITEMS: AppMenuItem[] = [
  { label: 'My Profile', icon: 'pi pi-user', routerLink: '/profile' },
  { label: 'My CV', icon: 'pi pi-file', routerLink: '/view-cv' }
];
