import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../base.component';
import { UserService } from '../../../../services/user/user.service';
import { AuthService } from '../../../../services/utility/security/auth.service';
import { PasswordPolicyService } from '../../../../services/password-policy/password.policy.service';
import { PasswordPolicy } from '../../../../services/password-policy/domain/password.policy.domain';

@Component({
  selector: 'app-change-password',
  templateUrl: './change.password.component.html',
  styleUrls: ['./change.password.component.scss']
})
export class ChangePasswordComponent extends BaseComponent implements OnInit {
  step: 'verify' | 'otp' | 'reset' = 'verify';
  verifyForm!: FormGroup;
  otpForm!: FormGroup;
  resetForm!: FormGroup;
  private oldPassword = '';
  private verifiedOtp = '';
  policy: PasswordPolicy = {
    id: 0,
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireDigit: true,
    requireSpecialChar: true,
    disallowUserInfoInPassword: true
  };

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private passwordPolicyService: PasswordPolicyService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.verifyForm = this.formBuilder.group({
      oldPassword: ['', Validators.required]
    });

    this.otpForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });

    this.resetForm = this.formBuilder.group({
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.subscribers.passwordPolicySub = this.passwordPolicyService.getPasswordPolicy().subscribe(res => {
      if (res?.obj) { this.policy = res.obj; }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')!.value === form.get('confirmPassword')!.value
      ? null
      : { passwordMismatch: true };
  }

  get newPasswordValue(): string {
    return this.resetForm?.get('newPassword')?.value || '';
  }

  hasMinLength(): boolean {
    return this.newPasswordValue.length >= this.policy.minLength;
  }

  hasUppercase(): boolean {
    return /[A-Z]/.test(this.newPasswordValue);
  }

  hasLowercase(): boolean {
    return /[a-z]/.test(this.newPasswordValue);
  }

  hasDigit(): boolean {
    return /[0-9]/.test(this.newPasswordValue);
  }

  hasSpecialChar(): boolean {
    return /[^A-Za-z0-9]/.test(this.newPasswordValue);
  }

  requirementsMet(): number {
    let met = 0;
    let total = 1;
    if (this.hasMinLength()) { met++; }
    if (this.policy.requireUppercase) { total++; if (this.hasUppercase()) { met++; } }
    if (this.policy.requireLowercase) { total++; if (this.hasLowercase()) { met++; } }
    if (this.policy.requireDigit) { total++; if (this.hasDigit()) { met++; } }
    if (this.policy.requireSpecialChar) { total++; if (this.hasSpecialChar()) { met++; } }
    return Math.round((met / total) * 100);
  }

  strengthLabel(): string {
    const score = this.requirementsMet();
    if (!this.newPasswordValue) { return ''; }
    if (score < 50) { return 'auth.register.strengthWeak'; }
    if (score < 100) { return 'auth.register.strengthFair'; }
    return 'auth.register.strengthStrong';
  }

  strengthClass(): string {
    const score = this.requirementsMet();
    if (score < 50) { return 'weak'; }
    if (score < 100) { return 'fair'; }
    return 'strong';
  }

  requestOtp(): void {
    if (this.isFormInvalid(this.verifyForm)) { return; }

    this.oldPassword = this.verifyForm.getRawValue().oldPassword;
    this.subscribers.requestOtpSub = this.userService.requestChangePasswordOtp({ oldPassword: this.oldPassword }).subscribe(() => {
      this.step = 'otp';
    });
  }

  resendOtp(): void {
    this.otpForm.reset();
    this.subscribers.resendOtpSub = this.userService.requestChangePasswordOtp({ oldPassword: this.oldPassword }).subscribe(() => {
      this.notificationService.sendSuccessMsg('auth.register.resendSuccess');
    });
  }

  verifyOtp(): void {
    if (this.isFormInvalid(this.otpForm)) { return; }

    const { otp } = this.otpForm.getRawValue();
    this.subscribers.verifyOtpSub = this.userService.verifyChangePasswordOtp({ otp }).subscribe(() => {
      this.verifiedOtp = otp;
      this.step = 'reset';
    });
  }

  submit(): void {
    if (this.step === 'verify') { this.requestOtp(); return; }
    if (this.step === 'otp') { this.verifyOtp(); return; }
    if (this.isFormInvalid(this.resetForm)) { return; }

    const { newPassword, confirmPassword } = this.resetForm.getRawValue();
    const payload = { oldPassword: this.oldPassword, otp: this.verifiedOtp, newPassword, confirmPassword };

    this.subscribers.changePasswordSub = this.userService.changePassword(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('password.changeSuccess');
      this.authService.logout();
      this.router.navigate(['/login']);
    });
  }

}
