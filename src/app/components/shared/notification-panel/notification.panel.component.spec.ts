import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import en from '../../../../assets/i18n/en.json';
import { NotificationPanelComponent } from './notification.panel.component';
import { InAppNotificationService } from '../../../services/notification-center/in.app.notification.service';
import { AppNotification } from '../../../services/notification-center/domain/notification.domain';

function notification(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    id: 1,
    type: 'OFFER_RECEIVED',
    actionRoute: '/my/applications/7',
    params: { jobTitle: 'Java Developer' },
    read: false,
    createdOn: new Date().toISOString(),
    ...overrides
  };
}

describe('NotificationPanelComponent', () => {
  let fixture: ComponentFixture<NotificationPanelComponent>;
  let component: NotificationPanelComponent;
  let service: jasmine.SpyObj<InAppNotificationService>;
  let router: jasmine.SpyObj<Router>;
  let unreadCount$: BehaviorSubject<number>;
  let items$: BehaviorSubject<AppNotification[]>;
  let unreadOnly$: BehaviorSubject<boolean>;

  beforeEach(() => {
    document.body.querySelectorAll('.p-sidebar-mask, .notification-sidebar').forEach(node => node.remove());
    unreadCount$ = new BehaviorSubject<number>(0);
    items$ = new BehaviorSubject<AppNotification[]>([]);
    unreadOnly$ = new BehaviorSubject<boolean>(false);
    service = jasmine.createSpyObj('InAppNotificationService',
      ['loadFirstPage', 'loadMore', 'markRead', 'markAllRead', 'dismiss', 'setUnreadOnly', 'setPanelOpen'], {
      unreadCount$: unreadCount$.asObservable(),
      items$: items$.asObservable(),
      hasMore$: new BehaviorSubject<boolean>(false).asObservable(),
      unreadOnly$: unreadOnly$.asObservable()
    });
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      declarations: [NotificationPanelComponent],
      imports: [NoopAnimationsModule, TranslateModule.forRoot(), ButtonModule, SidebarModule],
      providers: [
        { provide: InAppNotificationService, useValue: service },
        { provide: Router, useValue: router }
      ]
    });

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.use('en');

    fixture = TestBed.createComponent(NotificationPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function badge(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.notification-badge');
  }

  function openPanel(items: AppNotification[]): void {
    items$.next(items);
    component.open();
    fixture.detectChanges();
  }

  function bodyText(): string {
    return document.body.querySelector('.notification-sidebar')?.textContent ?? '';
  }


  it('shows no badge when there is nothing unread', () => {
    expect(badge()).toBeNull();
  });

  it('shows the unread count on the bell', () => {
    unreadCount$.next(3);
    fixture.detectChanges();

    expect(badge()?.textContent?.trim()).toBe('3');
  });

  it('caps the badge at 99+', () => {
    unreadCount$.next(250);
    fixture.detectChanges();

    expect(badge()?.textContent?.trim()).toBe('99+');
  });

  it('describes the unread count on the bell for screen readers', () => {
    unreadCount$.next(4);
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.notification-bell').getAttribute('aria-label');
    expect(label).toBe('Notifications, 4 unread');
  });

  it('opens on the first bell click and closes on the second, reflecting it in aria-expanded', () => {
    const bell: HTMLElement = fixture.nativeElement.querySelector('.notification-bell');
    expect(bell.getAttribute('aria-expanded')).toBe('false');

    bell.click();
    fixture.detectChanges();
    expect(component.visible).toBeTrue();
    expect(bell.getAttribute('aria-expanded')).toBe('true');
    expect(service.loadFirstPage).toHaveBeenCalledTimes(1);

    bell.click();
    fixture.detectChanges();
    expect(component.visible).toBeFalse();
    expect(bell.getAttribute('aria-expanded')).toBe('false');
    expect(service.loadFirstPage).toHaveBeenCalledTimes(1);
  });

  it('tells the service whether the panel is open, including when the sidebar closes itself', () => {
    component.open();
    expect(service.setPanelOpen).toHaveBeenCalledWith(true);

    component.setVisible(false);
    expect(component.visible).toBeFalse();
    expect(service.setPanelOpen).toHaveBeenCalledWith(false);
  });

  it('switches between all and unread notifications from the filter buttons', () => {
    openPanel([notification()]);
    const options: HTMLElement[] = Array.from(document.body.querySelectorAll('.notification-filter-option'));

    expect(options.map(option => option.textContent?.trim())).toEqual(['All', 'Unread']);
    expect(options[0].classList).toContain('active');

    options[1].click();
    expect(service.setUnreadOnly).toHaveBeenCalledWith(true);

    unreadOnly$.next(true);
    fixture.detectChanges();
    expect(options[1].classList).toContain('active');
    expect(options[1].getAttribute('aria-pressed')).toBe('true');
    expect(options[0].classList).not.toContain('active');

    options[0].click();
    expect(service.setUnreadOnly).toHaveBeenCalledWith(false);
  });

  it('keeps the filter buttons visible when the unread list is empty, so the user can switch back', () => {
    unreadOnly$.next(true);
    openPanel([]);

    expect(bodyText()).toContain("You're all caught up");
    expect(document.body.querySelectorAll('.notification-filter-option').length).toBe(2);
  });

  it('shows the new reminder types with readable dates', () => {
    openPanel([
      notification({ id: 3, type: 'JOB_DEADLINE_SOON', params: { jobTitle: 'Designer', deadlineDate: '2026-10-05' } }),
      notification({ id: 2, type: 'MCQ_TEST_CLOSING', params: { jobTitle: 'QA Engineer', testName: 'Java basics', closesAt: '2026-10-05T12:00:00Z' } }),
      notification({ id: 1, type: 'ONBOARDING_TASK_DUE', params: { title: 'Sign contract', dueDate: '2026-10-07' } })
    ]);

    expect(bodyText()).toContain('Applications for Designer close on 5 Oct 2026.');
    expect(bodyText()).toContain('Start Java basics for QA Engineer before 5 Oct 2026');
    expect(bodyText()).not.toContain('2026-10-05T12:00:00Z');
    expect(bodyText()).toContain('Onboarding task Sign contract is due on 7 Oct 2026.');
  });

  it('loads the list when opened', () => {
    component.open();

    expect(component.visible).toBeTrue();
    expect(service.loadFirstPage).toHaveBeenCalled();
  });

  it('renders the translated title and message with its params', () => {
    openPanel([notification()]);

    expect(bodyText()).toContain('You have a job offer');
    expect(bodyText()).toContain('You received an offer for Java Developer.');
  });

  it('formats a scheduled interview time instead of showing the raw ISO string', () => {
    openPanel([notification({
      type: 'INTERVIEW_SCHEDULED',
      params: { jobTitle: 'QA Engineer', interviewTitle: 'Technical round', scheduledAt: '2026-10-05T12:00:00Z' }
    })]);

    expect(bodyText()).toContain('Technical round for QA Engineer');
    expect(bodyText()).not.toContain('2026-10-05T12:00:00Z');
  });

  it('falls back to a generic message for a type this client does not know', () => {
    openPanel([notification({ type: 'SOMETHING_NEW_FROM_A_NEWER_BACKEND' })]);

    expect(bodyText()).toContain('New notification');
    expect(bodyText()).not.toContain('notification.types');
  });

  it('never leaves an unresolved placeholder visible when a param is missing', () => {
    openPanel([notification({ type: 'NEW_APPLICATION', params: { jobTitle: 'Designer' } })]);

    expect(bodyText()).not.toContain('{{');
    expect(bodyText()).toContain('applied for Designer');
  });

  it('shows the empty state when there are no notifications', () => {
    openPanel([]);

    expect(bodyText()).toContain("You're all caught up");
  });

  it('marks read, closes and navigates to a relative route when an item is selected', () => {
    const item = notification();
    component.visible = true;

    component.select(item);

    expect(service.markRead).toHaveBeenCalledWith(item);
    expect(component.visible).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/my/applications/7');
  });

  it('does not navigate to an absolute, protocol-relative or missing route', () => {
    ['https://evil.example.com', '//evil.example.com', null, undefined].forEach(route => {
      component.select(notification({ actionRoute: route }));
    });

    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(service.markRead).toHaveBeenCalledTimes(4);
  });

  it('formats how long ago a notification arrived', () => {
    const ago = (ms: number) => component.timeAgo(new Date(Date.now() - ms).toISOString());

    expect(ago(10 * 1000)).toBe('Just now');
    expect(ago(5 * 60 * 1000)).toBe('5 min ago');
    expect(ago(3 * 60 * 60 * 1000)).toBe('3 h ago');
    expect(ago(2 * 24 * 60 * 60 * 1000)).toBe('2 d ago');
  });

  it('treats a timestamp slightly in the future (clock skew) as just now', () => {
    expect(component.timeAgo(new Date(Date.now() + 30000).toISOString())).toBe('Just now');
  });
});

@Component({ template: '<app-notification-panel *ngIf="show"></app-notification-panel>' })
class HostComponent {
  show = true;
}

describe('NotificationPanelComponent when its parent removes it (e.g. sign-out or a 401 while open)', () => {
  beforeEach(() => {
    document.body.querySelectorAll('.p-sidebar-mask, .notification-sidebar').forEach(node => node.remove());
  });

  it('leaves no sidebar or mask behind in the page', () => {
    const service = jasmine.createSpyObj('InAppNotificationService', ['loadFirstPage', 'setPanelOpen'], {
      unreadCount$: new BehaviorSubject<number>(1).asObservable(),
      items$: new BehaviorSubject<AppNotification[]>([notification()]).asObservable(),
      hasMore$: new BehaviorSubject<boolean>(false).asObservable(),
      unreadOnly$: new BehaviorSubject<boolean>(false).asObservable()
    });

    TestBed.configureTestingModule({
      declarations: [HostComponent, NotificationPanelComponent],
      imports: [NoopAnimationsModule, TranslateModule.forRoot(), ButtonModule, SidebarModule],
      providers: [
        { provide: InAppNotificationService, useValue: service },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigateByUrl']) }
      ]
    });

    const host = TestBed.createComponent(HostComponent);
    host.detectChanges();
    host.debugElement.query(By.directive(NotificationPanelComponent)).componentInstance.open();
    host.detectChanges();
    expect(document.body.querySelectorAll('.notification-sidebar').length).toBe(1);

    host.componentInstance.show = false;
    host.detectChanges();

    expect(document.body.querySelectorAll('.notification-sidebar').length).toBe(0);
    expect(document.body.querySelectorAll('.p-sidebar-mask').length).toBe(0);
    expect(service.setPanelOpen.calls.mostRecent().args).toEqual([false]);
  });
});
