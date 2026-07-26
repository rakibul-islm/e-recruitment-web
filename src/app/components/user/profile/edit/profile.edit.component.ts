import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../base.component';
import { AuthService } from '../../../../services/utility/security/auth.service';
import { NotificationService } from '../../../../services/utility/notification.service';
import { UserService } from '../../../../services/user/user.service';

@Component({
  selector: 'profile-edit',
  templateUrl: './profile.edit.component.html',
  styleUrls: ['./profile.edit.component.scss']
})
export class ProfileEditComponent extends BaseComponent implements OnInit {
  editForm!: FormGroup;
  private user: any;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribers.profileSub = this.authService.getProfileData().subscribe(profile => {
      if (profile?.id) {
        this.loadUser(profile.id);
      }
    });
  }

  loadUser(id: number) {
    this.subscribers.findUserSub = this.userService.findUserById(id).subscribe(response => {
      this.user = response?.obj;
      this.prepareForm(this.user);
    });
  }

  prepareForm(user: any) {
    this.editForm = this.formBuilder.group({
      fullName: [user.fullName, Validators.required],
      email: [user.email, [Validators.required, Validators.email]],
      address: [user.address],
      phone: [user.phone],
      mobile: [user.mobile, [Validators.required, Validators.pattern('^[0-9]{11}$')]]
    });
  }

  save() {
    this.markFormGroupAsTouched(this.editForm);
    if (this.editForm.invalid) { return; }

    const payload = {
      ...this.user,
      ...this.editForm.getRawValue()
    };

    this.subscribers.updateUserSub = this.userService.updateUser(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('Profile updated successfully!');
      this.navigateToProfile();
    });
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
}
