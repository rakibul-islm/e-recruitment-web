import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Router, Scroll } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

const RETRY_INTERVAL_MS = 50;
const RESTORE_DEADLINE_MS = 5000;
const USER_INPUT_EVENTS: Array<keyof WindowEventMap> = ['wheel', 'touchmove', 'keydown'];

@Injectable({ providedIn: 'root' })
export class ScrollRestorationService implements OnDestroy {
  private subscription: Subscription;
  private timer: number | null = null;
  private readonly stopTimer = (): void => this.clearTimer();

  constructor(router: Router, private ngZone: NgZone) {
    this.subscription = router.events.pipe(
      filter((event): event is Scroll => event instanceof Scroll)
    ).subscribe(event => {
      this.clearTimer();
      if (!event.position) { return; }
      const [x, y] = event.position;
      this.ngZone.runOutsideAngular(() => this.restore(x, y));
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.clearTimer();
  }

  private restore(x: number, y: number): void {
    const deadline = Date.now() + RESTORE_DEADLINE_MS;
    USER_INPUT_EVENTS.forEach(name => window.addEventListener(name, this.stopTimer, { passive: true }));
    this.timer = window.setInterval(() => {
      if (window.scrollX !== x || window.scrollY !== y) {
        window.scrollTo(x, y);
      }
      if ((window.scrollX === x && window.scrollY === y) || Date.now() > deadline) {
        this.clearTimer();
      }
    }, RETRY_INTERVAL_MS);
  }

  private clearTimer(): void {
    if (this.timer === null) { return; }
    window.clearInterval(this.timer);
    this.timer = null;
    USER_INPUT_EVENTS.forEach(name => window.removeEventListener(name, this.stopTimer));
  }
}
