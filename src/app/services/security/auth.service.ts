import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
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
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(API_URLS.AUTHENTICATE, { username, password }).pipe(
      map(response => {
        if (response.success && response.obj?.token) {
          localStorage.setItem('token', response.obj.token);
          this.isLoggedInSubject.next(true);
          return true;
        }
        return false;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}
