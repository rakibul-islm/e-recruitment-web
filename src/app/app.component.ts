import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { LoadingService } from './services/utility/loading.service';
import { LanguageService } from './services/utility/language.service';
import { InAppNotificationService } from './services/notification-center/in.app.notification.service';
import { GuestPresenceService } from './services/presence/guest.presence.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'e-recruitment';
  // Hides the site header/nav on routes that opt in via `data: { fullScreen: true }` (currently
  // only the timed MCQ test-taking screen) - kept as a small router-driven flag here rather than
  // duplicating the header markup, since it's the only chrome-free route in the app.
  fullScreen = false;

  constructor(public loadingService: LoadingService, languageService: LanguageService, notificationService: InAppNotificationService,
    guestPresenceService: GuestPresenceService, router: Router, route: ActivatedRoute) {
    languageService.init();

    router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => {
        let current = route;
        while (current.firstChild) { current = current.firstChild; }
        return current.snapshot.data['fullScreen'] === true;
      })
    ).subscribe(fullScreen => {
      this.fullScreen = fullScreen;
      notificationService.setToastsSuppressed(fullScreen);
    });
  }
}
