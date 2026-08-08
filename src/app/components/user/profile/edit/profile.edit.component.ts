import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../base.component';
import { AuthService } from '../../../../services/utility/security/auth.service';
import { UserService } from '../../../../services/user/user.service';

@Component({
  selector: 'profile-edit',
  templateUrl: './profile.edit.component.html',
  styleUrls: ['./profile.edit.component.scss']
})
export class ProfileEditComponent extends BaseComponent implements OnInit {
  editForm!: FormGroup;
  imageBase64: string = '';
  user: any;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchProfile();
  }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imageBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imageBase64 = '';
  }

  fetchProfile() {
    this.subscribers.fetchProfileSub = this.userService.fetchProfileData(new Map()).subscribe(response => {
      this.user = response?.obj;
      this.imageBase64 = this.user?.imageBase64 ? 'data:image/png;base64,' + this.user.imageBase64 : '';
      this.prepareForm(this.user);
    });
  }

  prepareForm(user: any) {
    this.editForm = this.formBuilder.group({
      fullName: [user.fullName, Validators.required],
      email: [{ value: user.email, disabled: true }, [Validators.required, Validators.email]],
      address: [user.address],
      phone: [user.phone],
      mobile: [user.mobile, [Validators.required, Validators.pattern('^[0-9]{11}$')]]
    });
  }

  save() {
    if (this.isFormInvalid(this.editForm)) { return; }

    const payload = {
      ...this.user,
      ...this.editForm.getRawValue(),
      imageBase64: this.imageBase64 ? this.imageBase64.split(',')[1] || '' : ''
    };

    this.subscribers.updateProfileSub = this.userService.updateProfile(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('Profile updated successfully!');
      this.refreshProfile();
    });
  }

  refreshProfile(): void {
    this.subscribers.fetchProfileDataSub = this.userService.fetchProfileData(new Map()).subscribe(data => {
      const profile = data?.obj;
      if (profile?.imageBase64) {
        profile.imageBase64 = 'data:image/png;base64,' + profile.imageBase64;
      }
      this.authService.setProfileData(profile);
      this.navigateToProfile();
    });
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
}
