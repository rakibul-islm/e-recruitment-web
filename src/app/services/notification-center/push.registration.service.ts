import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';
import { PushNotifications } from '@capacitor/push-notifications';
import { API_URLS } from '../utility/constants/api.urls';
import { BACKGROUND_REQUEST } from '../utility/interceptors/http.context.tokens';
import { AuthService } from '../utility/security/auth.service';
import { isNativeApp } from '../utility/file-download.util';
import { InAppNotificationService } from './in.app.notification.service';

const CHANNEL_ID = 'general';
const HIGH_IMPORTANCE = 4;

@Injectable({
  providedIn: 'root'
})
export class PushRegistrationService {
  private deviceToken: string | null = null;
  private authToken: string | null = null;
  private listening = false;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService, private notifications: InAppNotificationService) {
    if (!isNativeApp()) { return; }
    authService.isLoggedIn().subscribe(loggedIn => loggedIn ? this.onLogin() : this.onLogout());
  }

  private async onLogin(): Promise<void> {
    this.authToken = this.authService.getToken();
    this.addListeners();
    try {
      await PushNotifications.createChannel({ id: CHANNEL_ID, name: 'Notifications', importance: HIGH_IMPORTANCE });
      if (await this.permissionGranted()) { await PushNotifications.register(); }
    } catch {
      return;
    }
  }

  unregisterDevice(): Observable<unknown> {
    const deviceToken = this.deviceToken;
    if (!deviceToken) { return of(null); }
    this.deviceToken = null;
    PushNotifications.unregister().catch(() => {});
    return this.http.post(API_URLS.UNREGISTER_DEVICE_TOKEN, { token: deviceToken }, {
      context: new HttpContext().set(BACKGROUND_REQUEST, true)
    }).pipe(catchError(() => of(null)));
  }

  private onLogout(): void {
    const deviceToken = this.deviceToken;
    const authToken = this.authToken;
    this.deviceToken = null;
    this.authToken = null;
    if (!deviceToken) { return; }

    if (authToken) {
      this.http.post(API_URLS.UNREGISTER_DEVICE_TOKEN, { token: deviceToken }, {
        headers: new HttpHeaders({ Authorization: `Bearer ${authToken}` }),
        context: new HttpContext().set(BACKGROUND_REQUEST, true)
      }).subscribe({ error: () => {} });
    }
    PushNotifications.unregister().catch(() => {});
  }

  private async permissionGranted(): Promise<boolean> {
    let status = await PushNotifications.checkPermissions();
    if (status.receive === 'prompt' || status.receive === 'prompt-with-rationale') {
      status = await PushNotifications.requestPermissions();
    }
    return status.receive === 'granted';
  }

  private addListeners(): void {
    if (this.listening) { return; }
    this.listening = true;

    PushNotifications.addListener('registration', ({ value }) => {
      this.deviceToken = value;
      if (!this.authService.getToken()) { return; }
      this.http.post(API_URLS.REGISTER_DEVICE_TOKEN, { token: value, platform: 'android' }, {
        context: new HttpContext().set(BACKGROUND_REQUEST, true)
      }).subscribe({ error: () => {} });
    });

    PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => this.openFromPush(notification.data));
  }

  private openFromPush(data: { notificationId?: string; route?: string } | undefined): void {
    const id = Number(data?.notificationId);
    if (id) { this.notifications.findById(id).subscribe(notification => notification && this.notifications.markRead(notification)); }

    const route = data?.route;
    if (route && route.startsWith('/') && !route.startsWith('//')) {
      this.router.navigateByUrl(route);
      return;
    }
    this.router.navigate(id ? ['/notifications', id] : ['/dashboard']);
  }
}
