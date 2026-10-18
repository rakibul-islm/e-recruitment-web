import { Component, OnInit } from '@angular/core';
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE, localMobile, withMobileValidation } from '../../../../utils/country.codes';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../base.component';
import { AuthService } from '../../../../services/utility/security/auth.service';
import { UserService } from '../../../../services/user/user.service';
import { resizeImageToDataUrl } from '../../../../utils/image.util';

const DEFAULT_COVER = '/assets/images/default-cover.svg';
const MAX_COVER_SOURCE_BYTES = 10 * 1024 * 1024;

@Component({
  selector: 'profile-edit',
  templateUrl: './profile.edit.component.html',
  styleUrls: ['./profile.edit.component.scss']
})
export class ProfileEditComponent extends BaseComponent implements OnInit {
  countryCodes = COUNTRY_CODES;
  editForm!: FormGroup;
  imageBase64: string = '';
  coverImage = '';
  coverChanged = false;
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

  onCoverChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    input.value = '';
    if (!file) { return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > MAX_COVER_SOURCE_BYTES) {
      this.notificationService.sendErrorMsg('profile.coverInvalid');
      return;
    }
    resizeImageToDataUrl(file, 1600).then(dataUrl => {
      this.coverImage = dataUrl;
      this.coverChanged = true;
    }).catch(() => this.notificationService.sendErrorMsg('profile.coverInvalid'));
  }

  useDefaultCover(): void {
    this.coverImage = '';
    this.coverChanged = true;
  }

  get coverStyle(): string {
    return 'url("' + (this.coverImage || DEFAULT_COVER) + '")';
  }

  fetchProfile() {
    this.subscribers.fetchProfileSub = this.userService.fetchProfileData(new Map()).subscribe(response => {
      this.user = response?.obj;
      this.imageBase64 = this.user?.imageBase64 ? 'data:image/png;base64,' + this.user.imageBase64 : '';
      this.prepareForm(this.user);
    });

    this.subscribers.fetchCoverSub = this.userService.fetchCover().subscribe(response => {
      if (!this.coverChanged) { this.coverImage = response?.obj || ''; }
    });
  }

  prepareForm(user: any) {
    this.editForm = this.formBuilder.group({
      fullName: [user.fullName, Validators.required],
      email: [{ value: user.email, disabled: true }, [Validators.required, Validators.email]],
      address: [user.address],
      secondaryMobileCountryCode: [user.secondaryMobileCountryCode || DEFAULT_COUNTRY_CODE, Validators.required],
      secondaryMobile: [localMobile(user.secondaryMobileCountryCode, user.secondaryMobile)],
      mobileCountryCode: [user.mobileCountryCode || DEFAULT_COUNTRY_CODE, Validators.required],
      mobile: [localMobile(user.mobileCountryCode, user.mobile), [Validators.required]]
    });
    withMobileValidation(this.editForm);
    withMobileValidation(this.editForm, 'secondaryMobile', 'secondaryMobileCountryCode');
  }

  save() {
    if (this.isFormInvalid(this.editForm)) { return; }

    const payload = {
      ...this.user,
      ...this.editForm.getRawValue(),
      imageBase64: this.imageBase64 ? this.imageBase64.split(',')[1] || '' : ''
    };

    this.subscribers.updateProfileSub = this.userService.updateProfile(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('profile.updateSuccess');
      if (!this.coverChanged) {
        this.refreshProfile();
        return;
      }
      this.subscribers.updateCoverSub = this.userService.updateCover(this.coverImage ? this.coverImage.split(',')[1] || '' : '').subscribe(() => this.refreshProfile());
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
