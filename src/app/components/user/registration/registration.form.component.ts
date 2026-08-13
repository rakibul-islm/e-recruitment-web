import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { Register } from '../../../services/user/domain/user.domain';
import { UserService } from '../../../services/user/user.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { PasswordPolicyService } from '../../../services/password-policy/password-policy.service';
import { PasswordPolicy } from '../../../services/password-policy/domain/password-policy.domain';

@Component({
  selector: 'app-signup',
  templateUrl: './registration.form.component.html',
  styleUrls: ['./registration.form.component.scss']
})
export class RegistrationFormComponent extends BaseComponent implements OnInit {
  step: 'form' | 'otp' = 'form';
  registerForm!: FormGroup;
  otpForm!: FormGroup;
  email = '';
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
    private router: Router,
    private userService: UserService,
    private commonConfirmDialogService: CommonConfirmDialogService,
    private passwordPolicyService: PasswordPolicyService) {
    super();
  }

  ngOnInit() {
    this.prepareForm();

    this.otpForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });

    this.subscribers.passwordPolicySub = this.passwordPolicyService.getPasswordPolicy().subscribe(res => {
      if (res?.obj) { this.policy = res.obj; }
    });
  }

  prepareForm(formData?: Register) {
    formData = formData || new Register();

    this.registerForm = this.formBuilder.group({
      fullName: [formData.fullName, Validators.required],
      email: [formData.email, [Validators.required, Validators.email]],
      mobile: [formData.mobile, [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      password: [formData.password, [Validators.required]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null
      : { passwordMismatch: true };
  }

  get passwordValue(): string {
    return this.registerForm?.get('password')?.value || '';
  }

  hasMinLength(): boolean {
    return this.passwordValue.length >= this.policy.minLength;
  }

  hasUppercase(): boolean {
    return /[A-Z]/.test(this.passwordValue);
  }

  hasLowercase(): boolean {
    return /[a-z]/.test(this.passwordValue);
  }

  hasDigit(): boolean {
    return /[0-9]/.test(this.passwordValue);
  }

  hasSpecialChar(): boolean {
    return /[^A-Za-z0-9]/.test(this.passwordValue);
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
    if (!this.passwordValue) { return ''; }
    if (score < 50) { return 'Weak'; }
    if (score < 100) { return 'Fair'; }
    return 'Strong';
  }

  strengthClass(): string {
    const score = this.requirementsMet();
    if (score < 50) { return 'weak'; }
    if (score < 100) { return 'fair'; }
    return 'strong';
  }

  submit() {
    if (this.isFormInvalid(this.registerForm)) { return; }

    const register: Register = this.registerForm.getRawValue();
    this.commonConfirmDialogService.confirm(() => this.createRegistration(register));
  }

  createRegistration(register: Register) {
    this.subscribers.createRegisterUserSub = this.userService.createRegisterUser(register)
    .subscribe(() => {
      this.email = register.email;
      this.step = 'otp';
    });
  }

  resendOtp(): void {
    this.otpForm.reset();
    this.subscribers.resendOtpSub = this.userService.resendSignupOtp(this.email).subscribe(() => {
      this.notificationService.sendSuccessMsg('A new OTP has been sent to your email.');
    });
  }

  submitOtp(): void {
    if (this.isFormInvalid(this.otpForm)) { return; }

    const { otp } = this.otpForm.getRawValue();
    this.subscribers.verifySignupOtpSub = this.userService.verifySignupOtp({ email: this.email, otp }).subscribe(() => {
      this.notificationService.sendSuccessMsg('Account verified successfully! Please sign in.');
      this.navigateToLogin();
    });
  }

  navigateToLogin(){
    this.router.navigate(['/login']);
  }
}
