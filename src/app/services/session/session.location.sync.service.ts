import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { API_URLS } from '../utility/constants/api.urls';
import { LocationService } from '../utility/location.service';
import { AuthService } from '../utility/security/auth.service';

// The session row is written during login, before the browser's exact position is known; this sends it once that position arrives.
@Injectable({
  providedIn: 'root'
})
export class SessionLocationSyncService {
  constructor(http: HttpClient, authService: AuthService, locationService: LocationService) {
    combineLatest([authService.isLoggedIn(), locationService.precisePlace$()])
      .pipe(filter(([loggedIn, place]) => loggedIn && !!place))
      .subscribe(() => http.put(API_URLS.PROFILE_SESSION_LOCATION, {}).subscribe({ error: () => { /* best effort */ } }));
  }
}
