import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user/user.service';
import { PermissionService } from '../../../services/permission/permission.service';
import { Permission } from '../../../services/permission/domain/permission.domain';
import { Profile } from '../../../services/user/domain/user.domain';
import { BaseComponent } from '../../base.component';
import { AuthService } from '../../../services/utility/security/auth.service';
import { AppMenuItem, MENU_ITEMS, ACCOUNT_MENU_ITEMS } from '../../../services/utility/constants/app.menu.model';

const BASE64_PREFIX = 'data:image/png;base64,';

@Component({
  selector: 'app-header',
  templateUrl: './app.header.component.html',
  styleUrls: ['./app.header.component.scss']
})
export class AppHeaderComponent extends BaseComponent implements OnInit {
  isAuthenticated: boolean = false;
  profile: Profile = new Profile();
  menuItems: AppMenuItem[] = [];
  accountMenuItems: AppMenuItem[] = [];

  constructor(
    private authService: AuthService,
    protected userService: UserService,
    private permissionService: PermissionService,
    private router: Router) {
    super();
  }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(authenticated => {
      this.isAuthenticated = authenticated;
      this.fetchProfileData();
      this.buildMenuItems();
    });

    this.subscribeToProfileData();
  }

  fetchProfileData() {
    if (!this.isAuthenticated) { return; }

    this.subscribers.fetchProfileDataSub = this.userService.fetchProfileData(new Map())
      .subscribe(data => {
        const profile = data?.obj || new Profile();
        if (profile.imageBase64) {
          profile.imageBase64 = BASE64_PREFIX + profile.imageBase64;
        }
        this.authService.setProfileData(profile);
      });
  }

  subscribeToProfileData(): void {
    this.subscribers.profileSub = this.authService.getProfileData().subscribe(profile => {
      this.profile = profile;
    });
  }

  buildMenuItems(): void {
    if (!this.isAuthenticated) {
      this.menuItems = this.filterMenuItems(MENU_ITEMS, new Set<string>());
      this.accountMenuItems = [];
      return;
    }

    this.subscribers.permissionsSub = this.permissionService.searchPermissions(new Map().set('isPageable', false))
      .subscribe(response => {
        const grantedRouteNames = this.resolveGrantedRouteNames(response?.list || []);
        this.menuItems = this.filterMenuItems(MENU_ITEMS, grantedRouteNames);
        this.accountMenuItems = [
          ...ACCOUNT_MENU_ITEMS,
          { separator: true },
          { label: 'Sign Out', icon: 'pi pi-sign-out', command: () => this.logout() }
        ];
      });
  }

  resolveGrantedRouteNames(permissions: Permission[]): Set<string> {
    return new Set(
      permissions
        .filter(permission => permission.routeName && this.authService.hasAuthority(permission.authority))
        .map(permission => permission.routeName)
    );
  }

  filterMenuItems(items: AppMenuItem[], grantedRouteNames: Set<string>): AppMenuItem[] {
    return items
      .map(item => item.items ? { ...item, items: this.filterMenuItems(item.items, grantedRouteNames) } : item)
      .filter(item => item.items ? item.items.length > 0 : (!item.routeName || grantedRouteNames.has(item.routeName)));
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
