import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Profile } from '../../user/domain/user.domain';
import { API_URLS } from '../constants/api.urls';

interface AuthResponse {
  success: boolean;
  message: string;
  obj?: { token: string };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  private profileSubject = new BehaviorSubject<Profile>(new Profile);
  private authorityCache: Record<string, boolean> | null = null;

  constructor(private http: HttpClient) {}

  login(email: string, password: string, rememberMe: boolean = false): Observable<boolean> {
    return this.http.post<AuthResponse>(API_URLS.AUTHENTICATE, { email, password }).pipe(
      map(response => {
        if (response.success && response.obj?.token) {
          this.setToken(response.obj.token, rememberMe);
          this.isLoggedInSubject.next(true);
          return true;
        }
        return false;
      })
    );
  }

  googleLogin(idToken: string, rememberMe: boolean = true): Observable<boolean> {
    return this.http.post<AuthResponse>(API_URLS.GOOGLE_AUTHENTICATE, { idToken }).pipe(
      map(response => {
        if (response.success && response.obj?.token) {
          this.setToken(response.obj.token, rememberMe);
          this.isLoggedInSubject.next(true);
          return true;
        }
        return false;
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(API_URLS.FORGOT_PASSWORD, { email });
  }

  verifyOtp(payload: { email: string; otp: string }): Observable<any> {
    return this.http.post(API_URLS.VERIFY_OTP, payload);
  }

  resetPassword(payload: { email: string; otp: string; newPassword: string; confirmPassword: string }): Observable<any> {
    return this.http.post(API_URLS.RESET_PASSWORD, payload);
  }

  setPassword(payload: { token: string; newPassword: string; confirmPassword: string }): Observable<any> {
    return this.http.post(API_URLS.SET_PASSWORD, payload);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    this.authorityCache = null;
    this.isLoggedInSubject.next(false);
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  getAuthorities(): Record<string, boolean> {
    if (!this.authorityCache) {
      this.authorityCache = this.decodeAuthorities(this.getToken());
    }
    return this.authorityCache;
  }

  hasAuthority(authority: string): boolean {
    const authorities = this.getAuthorities();
    return authorities['SUPER_ADMIN'] === true || authorities[authority] === true;
  }

  private setToken(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
    this.authorityCache = null;
  }

  private decodeAuthorities(token: string | null): Record<string, boolean> {
    if (!token) { return {}; }

    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const authorities: string[] = decoded?.userDetails?.authorities || [];

    const authorityMap: Record<string, boolean> = {};
    authorities.forEach(authority => authorityMap[authority] = true);
    return authorityMap;
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  setProfileData(profile: Profile) {
    this.profileSubject.next(profile);
  }

  getProfileData(): Observable<Profile> {
    return this.profileSubject.asObservable();
  }
}
