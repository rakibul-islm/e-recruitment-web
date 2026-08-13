import { Component, OnInit } from '@angular/core';
import { Profile } from '../../../../services/user/domain/user.domain';
import { BaseComponent } from '../../../../components/base.component';
import { AuthService } from '../../../../services/utility/security/auth.service';
import { UserService } from '../../../../services/user/user.service';

const BASE64_PREFIX = 'data:image/png;base64,';

@Component({
  selector: 'profile-view',
  templateUrl: './profile.view.component.html',
  styleUrls: ['./profile.view.component.scss']
})
export class ProfileViewComponent extends BaseComponent implements OnInit {
  profile: Profile = new Profile();

  constructor(
    protected authService: AuthService,
    private userService: UserService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribers.fetchProfileSub = this.userService.fetchProfileData(new Map()).subscribe(response => {
      const profile = response?.obj || new Profile();
      if (profile.imageBase64) {
        profile.imageBase64 = BASE64_PREFIX + profile.imageBase64;
      }
      this.authService.setProfileData(profile);
    });

    this.subscribers.profileSub = this.authService.getProfileData().subscribe(profile => {
      this.profile = profile;
    });
  }

}
