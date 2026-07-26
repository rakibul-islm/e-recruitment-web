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

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    this.isLoggedInSubject.next(false);
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
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
