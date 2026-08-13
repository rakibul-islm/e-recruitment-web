import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../../base.component';
import { AuthService } from '../../../../services/utility/security/auth.service';
import { PasswordPolicyService } from '../../../../services/password-policy/password-policy.service';
import { PasswordPolicy } from '../../../../services/password-policy/domain/password-policy.domain';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss']
})
export class SetPasswordComponent extends BaseComponent implements OnInit {
  setPasswordForm!: FormGroup;
  token = '';
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
    private route: ActivatedRoute,
    private authService: AuthService,
    private passwordPolicyService: PasswordPolicyService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    this.setPasswordForm = this.formBuilder.group({
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
    return this.setPasswordForm?.get('newPassword')?.value || '';
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

  submit(): void {
    if (this.isFormInvalid(this.setPasswordForm)) { return; }

    const { newPassword, confirmPassword } = this.setPasswordForm.getRawValue();
    this.subscribers.setPasswordSub = this.authService
      .setPassword({ token: this.token, newPassword, confirmPassword })
      .subscribe(() => {
        this.notificationService.sendSuccessMsg('Password set successfully! Please sign in.');
        this.router.navigate(['/login']);
      });
  }
}
