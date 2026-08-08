import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NotificationService } from '../notification.service';
import { AuthService } from '../security/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    let modifiedUrl = req.url;
    if (!req.url.startsWith('http')) {
      modifiedUrl = `${environment.baseUrl}${req.url}`;
    }

    const clonedRequest = req.clone({
      url: modifiedUrl,
      setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    });

    return next.handle(clonedRequest).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          this.handleError(error);
        }
        return throwError(() => error);
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = error?.error?.message || 'An unexpected error occurred!';

    if (error.status === 0) {
      errorMessage = error?.error?.message ||  'Network Error: Please check your internet connection.';
    } else if (error.status === 401) {
      errorMessage = error?.error?.message ||  'Unauthorized: Please log in again.';
      this.authService.logout();
      this.router.navigate(['/login']);
    } else if (error.status === 403) {
      errorMessage = error?.error?.message ||  'Forbidden: You do not have permission.';
    } else if (error.status === 404) {
      errorMessage = error?.error?.message ||  'Resource not found.';
    } else if (error.status >= 500) {
      errorMessage = error?.error?.message ||  'Server Error: Please try again later.';
    }

    this.notificationService.sendErrorMsg(errorMessage, `Error ${error.status}`);
  }
}
