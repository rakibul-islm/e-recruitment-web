import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpContext, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthInterceptor } from './auth.interceptor';
import { LoadingInterceptor } from './loading.interceptor';
import { BACKGROUND_REQUEST } from './http.context.tokens';
import { LoadingService } from '../loading.service';
import { NotificationService } from '../notification.service';
import { AuthService } from '../security/auth.service';

describe('background requests', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let loading: jasmine.SpyObj<LoadingService>;
  let notifications: jasmine.SpyObj<NotificationService>;
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const background = () => new HttpContext().set(BACKGROUND_REQUEST, true);

  function send(context?: HttpContext) {
    http.get('probe', { context }).subscribe({ error: () => undefined });
    return controller.expectOne(request => request.url.endsWith('probe'));
  }

  beforeEach(() => {
    loading = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    notifications = jasmine.createSpyObj('NotificationService', ['sendErrorMsg']);
    auth = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);
    auth.getToken.and.returnValue(null);
    router = jasmine.createSpyObj('Router', ['navigate']);
    const translate = jasmine.createSpyObj('TranslateService', ['instant']);
    translate.instant.and.returnValue('text');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: LoadingService, useValue: loading },
        { provide: NotificationService, useValue: notifications },
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
        { provide: TranslateService, useValue: translate }
      ]
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  it('shows the loading overlay for a normal request', () => {
    send().flush({});

    expect(loading.show).toHaveBeenCalledTimes(1);
    expect(loading.hide).toHaveBeenCalledTimes(1);
  });

  it('skips the loading overlay for a background request', () => {
    send(background()).flush({});

    expect(loading.show).not.toHaveBeenCalled();
    expect(loading.hide).not.toHaveBeenCalled();
  });

  it('toasts a server error for a normal request', () => {
    send().flush(null, { status: 500, statusText: 'Server Error' });

    expect(notifications.sendErrorMsg).toHaveBeenCalledTimes(1);
  });

  it('stays silent on a server error for a background request', () => {
    send(background()).flush(null, { status: 500, statusText: 'Server Error' });

    expect(notifications.sendErrorMsg).not.toHaveBeenCalled();
  });

  it('does not redirect to access-denied on a 403 for a background request', () => {
    send(background()).flush(null, { status: 403, statusText: 'Forbidden' });

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirects to access-denied on a 403 for a normal request', () => {
    send().flush(null, { status: 403, statusText: 'Forbidden' });

    expect(router.navigate).toHaveBeenCalledWith(['/access-denied']);
  });

  it('still signs the user out on a 401 for a background request', () => {
    send(background()).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
