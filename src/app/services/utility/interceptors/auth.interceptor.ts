import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { NotificationService } from '../notification.service';
import { AuthService } from '../security/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    let modifiedUrl = req.url;
    if (!req.url.startsWith('http') && !req.url.startsWith('/assets/')) {
      modifiedUrl = `${environment.baseUrl}${req.url}`;
    }

    const clonedRequest = req.clone({
      url: modifiedUrl,
      setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true,
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
    let errorMessage = error?.error?.message || this.translate.instant('errors.unexpected');

    if (error.status === 0) {
      errorMessage = error?.error?.message || this.translate.instant('errors.network');
    } else if (error.status === 401) {
      errorMessage = error?.error?.message || this.translate.instant('errors.unauthorized');
      this.authService.logout();
      this.router.navigate(['/login']);
    } else if (error.status === 403) {
      errorMessage = error?.error?.message || this.translate.instant('errors.forbidden');
    } else if (error.status === 404) {
      errorMessage = error?.error?.message || this.translate.instant('errors.notFound');
    } else if (error.status >= 500) {
      errorMessage = error?.error?.message || this.translate.instant('errors.server');
    }

    this.notificationService.sendErrorMsg(errorMessage, this.translate.instant('errors.title', { status: error.status }));
  }
}
