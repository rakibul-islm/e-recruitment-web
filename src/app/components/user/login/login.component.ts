import { AfterViewInit, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../services/utility/security/auth.service';
import { BaseComponent } from '../../base.component';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends BaseComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private translate: TranslateService,
    private router: Router,
    private ngZone: NgZone
  ) {
    super();
  }

  ngOnInit() {
    this.prepareForm();
  }

  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.ngZone.run(() => this.handleGoogleCredentialResponse(response))
    });

    google.accounts.id.renderButton(
      document.getElementById('google-button'),
      { size: 'medium' }
    );
  }

  handleGoogleCredentialResponse(response: any): void {
    this.subscribers.googleLoginSub = this.authService.googleLogin(response.credential).subscribe(
      success => {
        if (success) {
          this.notificationService.sendSuccessMsg(this.translate.instant('auth.login.successRedirect'));
          this.router.navigate(['/dashboard']);
        }
      }
    );
  }

  prepareForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  login() {
    if (this.isFormInvalid(this.loginForm)) { return; }

    const { email, password, rememberMe } = this.loginForm.getRawValue();
    this.subscribers.loginSub = this.authService.login(email, password, rememberMe).subscribe(
      success => {
        if (success) {
          this.notificationService.sendSuccessMsg(this.translate.instant('auth.login.successRedirect'));
          this.router.navigate(['/dashboard']);
        }
      }
    );
  }
}
