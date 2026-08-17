import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../services/user/user.service';
import { Profile } from '../../../services/user/domain/user.domain';
import { BaseComponent } from '../../base.component';
import { AuthService } from '../../../services/utility/security/auth.service';
import { PermissionService } from '../../../services/permission/permission.service';
import { LanguageService } from '../../../services/utility/language.service';
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
    private translate: TranslateService,
    private languageService: LanguageService,
    private router: Router) {
    super();
  }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(authenticated => {
      this.isAuthenticated = authenticated;
      this.fetchProfileData();
      this.loadMenuData();
    });

    this.subscribeToProfileData();

    this.subscribers.routePermissionsSub = this.permissionService.grantedRouteNames$
      .subscribe(() => this.renderMenuItems());

    this.subscribers.langChangeSub = this.translate.onLangChange.subscribe(() => this.renderMenuItems());
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

  loadMenuData(): void {
    if (!this.isAuthenticated) {
      this.permissionService.clearGrantedRouteNames();
      return;
    }

    this.permissionService.fetchGrantedRouteNames();
  }

  renderMenuItems(): void {
    this.menuItems = [...this.translateMenuItems(this.filterMenuItems(MENU_ITEMS)), this.languageService.buildLanguageMenuItem()];
    this.accountMenuItems = !this.isAuthenticated ? [] : [
      ...this.translateMenuItems(ACCOUNT_MENU_ITEMS),
      { separator: true },
      { label: this.translate.instant('account.signOut'), icon: 'pi pi-sign-out', command: () => this.logout() }
    ];
  }

  filterMenuItems(items: AppMenuItem[]): AppMenuItem[] {
    return items
      .map(item => item.items ? { ...item, items: this.filterMenuItems(item.items) } : item)
      .filter(item => item.items ? item.items.length > 0 : this.permissionService.hasRoutePermission(item.routeName));
  }

  translateMenuItems(items: AppMenuItem[]): AppMenuItem[] {
    return items.map(item => ({
      ...item,
      label: item.label ? this.translate.instant(item.label) : item.label,
      items: item.items ? this.translateMenuItems(item.items) : item.items
    }));
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
