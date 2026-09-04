import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/utility/security/auth.service';
import { BaseComponent } from '../../../base.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot.password.component.html',
  styleUrls: ['./forgot.password.component.scss']
})
export class ForgotPasswordComponent extends BaseComponent implements OnInit {
  step: 'email' | 'otp' | 'reset' = 'email';
  emailForm!: FormGroup;
  otpForm!: FormGroup;
  resetForm!: FormGroup;
  email = '';
  private verifiedOtp = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });

    this.resetForm = this.formBuilder.group({
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')!.value === form.get('confirmPassword')!.value
      ? null
      : { passwordMismatch: true };
  }

  submitEmail(): void {
    if (this.isFormInvalid(this.emailForm)) { return; }

    this.email = this.emailForm.getRawValue().email;
    this.subscribers.forgotPasswordSub = this.authService.forgotPassword(this.email).subscribe(() => {
      this.step = 'otp';
    });
  }

  resendOtp(): void {
    this.otpForm.reset();
    this.subscribers.resendOtpSub = this.authService.forgotPassword(this.email).subscribe(() => {
      this.notificationService.sendSuccessMsg('auth.register.resendSuccess');
    });
  }

  submitOtp(): void {
    if (this.isFormInvalid(this.otpForm)) { return; }

    const { otp } = this.otpForm.getRawValue();
    this.subscribers.verifyOtpSub = this.authService.verifyOtp({ email: this.email, otp }).subscribe(() => {
      this.verifiedOtp = otp;
      this.step = 'reset';
    });
  }

  submitReset(): void {
    if (this.isFormInvalid(this.resetForm)) { return; }

    const { newPassword, confirmPassword } = this.resetForm.getRawValue();
    this.subscribers.resetPasswordSub = this.authService
      .resetPassword({ email: this.email, otp: this.verifiedOtp, newPassword, confirmPassword })
      .subscribe(() => {
        this.notificationService.sendSuccessMsg('password.resetSuccess');
        this.router.navigate(['/login']);
      });
  }
}
