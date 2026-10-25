import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { LoadingService } from './services/utility/loading.service';
import { LanguageService } from './services/utility/language.service';
import { InAppNotificationService } from './services/notification-center/in.app.notification.service';
import { GuestPresenceService } from './services/presence/guest.presence.service';
import { SessionLocationSyncService } from './services/session/session.location.sync.service';
import { PushRegistrationService } from './services/notification-center/push.registration.service';
import { BackButtonService } from './services/utility/back.button.service';
import { ScrollRestorationService } from './services/utility/scroll.restoration.service';

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
  showScrollTop = false;
  private scroller: Element | null = null;
  elapsedSeconds$: Observable<number> = this.loadingService.loading$.pipe(
    switchMap(loading => loading ? timer(0, 1000) : of(0))
  );

  constructor(public loadingService: LoadingService, languageService: LanguageService, notificationService: InAppNotificationService,
    guestPresenceService: GuestPresenceService, sessionLocationSyncService: SessionLocationSyncService, pushRegistrationService: PushRegistrationService,
    backButtonService: BackButtonService, scrollRestorationService: ScrollRestorationService,
    router: Router, route: ActivatedRoute) {
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

  @HostListener('document:scroll', ['$event'])
  onScroll(event: Event): void {
    const target = event.target;
    const element = target instanceof Element ? target : document.scrollingElement;
    if (!element || (element !== document.scrollingElement && element.scrollHeight <= element.clientHeight * 1.5)) {
      return;
    }
    this.scroller = element;
    this.showScrollTop = element.scrollTop > 300;
  }

  formatElapsed(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  scrollToTop(): void {
    this.scroller?.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
