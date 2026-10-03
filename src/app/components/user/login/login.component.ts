import { AfterViewInit, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/utility/security/auth.service';
import { BaseComponent } from '../../base.component';
import { environment } from '../../../../environments/environment';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { isNativeApp } from '../../../services/utility/file-download.util';

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends BaseComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  isNative = isNativeApp();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {
    super();
  }

  ngOnInit() {
    this.prepareForm();
  }

  ngAfterViewInit(): void {
    if (this.isNative) {
      GoogleAuth.initialize({ clientId: environment.googleClientId, scopes: ['profile', 'email'], grantOfflineAccess: false });
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.ngZone.run(() => this.handleGoogleCredentialResponse(response))
    });

    google.accounts.id.renderButton(
      document.getElementById('google-button'),
      { size: 'medium' }
    );
  }

  async nativeGoogleLogin(): Promise<void> {
    try {
      const user = await GoogleAuth.signIn();
      this.ngZone.run(() => this.handleGoogleCredentialResponse({ credential: user.authentication.idToken }));
    } catch (error: any) {
      const code = String(error?.error ?? error?.code ?? '');
      if (code === '12501') { return; }
      const detail = [code, error?.message].filter(Boolean).join(': ') || 'unknown';
      this.notificationService.sendErrorMsg('auth.login.googleSignInFailed', { detail });
    }
  }

  handleGoogleCredentialResponse(response: any): void {
    this.subscribers.googleLoginSub = this.authService.googleLogin(response.credential).subscribe(
      success => {
        if (success) {
          this.notificationService.sendSuccessMsg('auth.login.successRedirect');
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
          this.notificationService.sendSuccessMsg('auth.login.successRedirect');
          this.router.navigate(['/dashboard']);
        }
      }
    );
  }
}
