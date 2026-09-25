import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { LanguageService } from './services/utility/language.service';
import { LoadingService } from './services/utility/loading.service';
import { InAppNotificationService } from './services/notification-center/in.app.notification.service';
import { GuestPresenceService } from './services/presence/guest.presence.service';

@Component({ template: '' })
class BlankComponent {}

describe('AppComponent and notification toasts', () => {
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;
  let notifications: jasmine.SpyObj<InAppNotificationService>;

  beforeEach(() => {
    notifications = jasmine.createSpyObj('InAppNotificationService', ['setToastsSuppressed']);

    TestBed.configureTestingModule({
      declarations: [AppComponent, BlankComponent],
      imports: [RouterTestingModule.withRoutes([
        { path: 'home', component: BlankComponent },
        { path: 'exam', component: BlankComponent, data: { fullScreen: true } }
      ])],
      providers: [
        { provide: InAppNotificationService, useValue: notifications },
        { provide: GuestPresenceService, useValue: {} },
        { provide: LanguageService, useValue: jasmine.createSpyObj('LanguageService', ['init']) },
        { provide: LoadingService, useValue: { loading$: of(false) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(AppComponent);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  async function navigateTo(url: string): Promise<void> {
    await fixture.ngZone!.run(() => router.navigateByUrl(url));
    fixture.detectChanges();
  }

  function headerShown(): boolean {
    return !!fixture.nativeElement.querySelector('app-header');
  }

  it('suppresses toasts and hides the header on a full-screen route such as the timed test', async () => {
    await navigateTo('/exam');

    expect(notifications.setToastsSuppressed).toHaveBeenCalledWith(true);
    expect(headerShown()).toBeFalse();
  });

  it('allows toasts and shows the header on a normal route', async () => {
    await navigateTo('/home');

    expect(notifications.setToastsSuppressed).toHaveBeenCalledWith(false);
    expect(headerShown()).toBeTrue();
  });

  it('allows toasts again after leaving the full-screen route', async () => {
    await navigateTo('/exam');
    await navigateTo('/home');

    expect(notifications.setToastsSuppressed.calls.allArgs()).toEqual([[true], [false]]);
  });
});
