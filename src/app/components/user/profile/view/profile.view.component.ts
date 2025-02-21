import { Component, forwardRef, Inject, OnInit } from '@angular/core';
import { Profile } from '../../../../services/user/domain/user.domain';
import { BaseComponent } from '../../../../components/base.component';
import { UserService } from '../../../../services/user/user.service';

@Component({
  selector: 'profile-view',
  templateUrl: './profile.view.component.html'
})
export class ProfileViewComponent extends BaseComponent implements OnInit {
  profile: Profile = new Profile();

  constructor(
    protected userService: UserService
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchProfileData();
  }

  fetchProfileData() {
    this.subscribers.fetchProfileDataSub = this.userService.fetchProfileData(new Map())
      .subscribe(data => {
        this.profile = data?.obj;
        if (this.profile.imageBase64) {
          this.profile.imageBase64 = 'data:image/png;base64,' + this.profile.imageBase64;
        }
      });
  }
}
