import { Injectable } from '@angular/core';
import { API_URLS } from '../utility/constants/api.urls';
import { openEventStream } from '../utility/event.stream';
import { AuthService } from '../utility/security/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GuestPresenceService {
  private closeStream?: () => void;

  constructor(authService: AuthService) {
    authService.isLoggedIn().subscribe(loggedIn => loggedIn ? this.disconnect() : this.connect());
  }

  private connect(): void {
    this.disconnect();
    this.closeStream = openEventStream(API_URLS.GUEST_PRESENCE_STREAM, null, () => {}, false);
  }

  private disconnect(): void {
    this.closeStream?.();
    this.closeStream = undefined;
  }
}
