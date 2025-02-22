import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/security/auth.service';
import { NotificationService } from '../../../services/utility/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {

  username = '';
  password = '';
  passwordFieldType: string = 'password';
  errorMessage = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private notificationService: NotificationService
  ) {}

  login() {
    this.authService.login(this.username, this.password).subscribe(
      success => {
        if (success) {
          this.notificationService.sendSuccessMsg('Login successful! Redirecting...');
          this.router.navigate(['/dashboard']);
        } else {
          this.notificationService.sendErrorMsg('Invalid username or password');
        }
      },
      error => {
        this.notificationService.sendErrorMsg('Login failed. Please try again.');
      }
    );
  }

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}