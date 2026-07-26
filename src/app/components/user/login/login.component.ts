import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/utility/notification.service';
import { AuthService } from '../../../services/utility/security/auth.service';
import { BaseComponent } from '../../base.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends BaseComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    super();
  }

  ngOnInit() {
    this.prepareForm();
  }

  prepareForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  login() {
    this.markFormGroupAsTouched(this.loginForm);
    if (this.loginForm.invalid) { return; }

    const { email, password, rememberMe } = this.loginForm.getRawValue();
    this.subscribers.loginSub = this.authService.login(email, password, rememberMe).subscribe(
      success => {
        if (success) {
          this.notificationService.sendSuccessMsg('Login successful! Redirecting...');
          this.router.navigate(['/dashboard']);
        }
      }
    );
  }
}
