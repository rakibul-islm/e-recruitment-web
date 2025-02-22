import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/utility/notification.service';
import { AuthService } from '../../../services/utility/security/auth.service';

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
        }
      }
    );
  }

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}