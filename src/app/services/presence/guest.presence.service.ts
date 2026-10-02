import { Injectable } from '@angular/core';
import { API_URLS } from '../utility/constants/api.urls';
import { openEventStream } from '../utility/event.stream';
import { AuthService } from '../utility/security/auth.service';
import { LocationService } from '../utility/location.service';

@Injectable({
  providedIn: 'root'
})
export class GuestPresenceService {
  private closeStream?: () => void;

  private loggedIn = false;

  constructor(authService: AuthService, private locationService: LocationService) {
    authService.isLoggedIn().subscribe(loggedIn => {
      this.loggedIn = loggedIn;
      loggedIn ? this.disconnect() : this.connect();
    });
    // reconnect once the browser reports a position; the new stream opens before the old one closes so the guest never drops out of the count
    locationService.place$().subscribe(place => {
      if (place && !this.loggedIn && this.closeStream) { this.connect(); }
    });
  }

  private connect(): void {
    const previous = this.closeStream;
    this.closeStream = openEventStream(API_URLS.GUEST_PRESENCE_STREAM, null, () => {}, false, this.locationService.getHeaders());
    previous?.();
  }

  private disconnect(): void {
    this.closeStream?.();
    this.closeStream = undefined;
  }
}
