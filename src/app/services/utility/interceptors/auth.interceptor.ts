import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NotificationService } from '../notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    let modifiedUrl = req.url;
    if (!req.url.startsWith('http')) {
      modifiedUrl = `${environment.baseUrl}${req.url}`;
    }

    const clonedRequest = req.clone({
      url: modifiedUrl,
      setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    });

    return next.handle(clonedRequest).pipe(
      tap((event) => {
        if (event instanceof HttpResponse && event.body && event.body.success === false) {
          this.notificationService.sendErrorMsg(event.body.message || 'An error occurred', 'Error');
          throw new Error(event.body.message);
        }
      }),
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          this.handleError(error);
        }
        return throwError(() => error);
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unexpected error occurred!';

    if (error.status === 0) {
      errorMessage = 'Network Error: Please check your internet connection.';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized: Please log in again.';
    } else if (error.status === 403) {
      errorMessage = 'Forbidden: You do not have permission.';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found.';
    } else if (error.status >= 500) {
      errorMessage = 'Server Error: Please try again later.';
    }

    this.notificationService.sendErrorMsg(errorMessage, `Error ${error.status}`);
  }
}
