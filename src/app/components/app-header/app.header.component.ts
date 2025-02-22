import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { Profile } from '../../services/user/domain/user.domain';
import { BaseComponent } from '../base.component';
import { AuthService } from '../../services/utility/security/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './app.header.component.html'
})
export class AppHeaderComponent extends BaseComponent implements OnInit {
  isAuthenticated: boolean = false;
  profile: Profile = new Profile();

  constructor(
    private authService: AuthService, 
    protected userService: UserService,
    private router: Router) {
    super();
  }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(authenticated => {
      this.isAuthenticated = authenticated;
      this.fetchProfileData();
    });
  }

  fetchProfileData() {
    if(!this.isAuthenticated) {
      this.profile.imageBase64 = "data:image/png;base64,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";
      return;
    }
    this.subscribers.fetchProfileDataSub = this.userService.fetchProfileData(new Map())
      .subscribe(data => {
        this.profile = data?.obj;
        if (this.profile.imageBase64) {
          this.profile.imageBase64 = 'data:image/png;base64,' + this.profile.imageBase64;
        }
        this.authService.setProfileData(this.profile);
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}