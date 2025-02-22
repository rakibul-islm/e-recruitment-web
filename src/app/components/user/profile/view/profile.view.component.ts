import { Component, OnInit } from '@angular/core';
import { Profile } from '../../../../services/user/domain/user.domain';
import { BaseComponent } from '../../../../components/base.component';
import { AuthService } from '../../../../services/utility/security/auth.service';

@Component({
  selector: 'profile-view',
  templateUrl: './profile.view.component.html'
})
export class ProfileViewComponent extends BaseComponent implements OnInit {
  profile: Profile = new Profile();

  constructor(
    protected authService: AuthService
  ) {
    super();
  }

  ngOnInit(): void {
    this.authService.getProfileData().subscribe(profile => {
      this.profile = profile;
    });
  }

}
