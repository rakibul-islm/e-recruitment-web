import { TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { InAppNotificationService } from './in.app.notification.service';
import { AppNotification } from './domain/notification.domain';
import { AuthService } from '../utility/security/auth.service';
import { NotificationService } from '../utility/notification.service';
import { NotificationTextService } from './notification.text.service';
import { API_URLS } from '../utility/constants/api.urls';
import { BACKGROUND_REQUEST } from '../utility/interceptors/http.context.tokens';

const POLL_INTERVAL_MS = 60000;

function notification(id: number, read = false, type = 'OFFER_RECEIVED'): AppNotification {
  return { id, type, actionRoute: '/my/applications/1', params: {}, read, createdOn: new Date().toISOString() };
}

describe('InAppNotificationService', () => {
  let http: HttpTestingController;
  let loggedIn$: BehaviorSubject<boolean>;
  let service: InAppNotificationService;
  let unreadCount: number;
  let toast: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    spyOnProperty(document, 'hidden', 'get').and.returnValue(false);
    loggedIn$ = new BehaviorSubject<boolean>(false);
    toast = jasmine.createSpyObj('NotificationService', ['sendInfoMsg']);
    const text = jasmine.createSpyObj('NotificationTextService', ['title', 'message']);
    text.title.and.callFake((item: AppNotification) => 'title:' + item.type);
    text.message.and.callFake((item: AppNotification) => 'message:' + item.type);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { isLoggedIn: () => loggedIn$.asObservable() } },
        { provide: NotificationService, useValue: toast },
        { provide: NotificationTextService, useValue: text }
      ]
    });

    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(InAppNotificationService);
    service.unreadCount$.subscribe(count => unreadCount = count);
  });

  it('does not call the server while logged out', fakeAsync(() => {
    tick(POLL_INTERVAL_MS * 2);

    http.expectNone(API_URLS.NOTIFICATION_POLL);
    expect(unreadCount).toBe(0);
  }));

  it('polls once logged in, marking the request as background so no overlay or toast is shown', fakeAsync(() => {
    loggedIn$.next(true);
    tick();

    const request = http.expectOne(API_URLS.NOTIFICATION_POLL);
    expect(request.request.context.get(BACKGROUND_REQUEST)).toBeTrue();
    request.flush({ obj: { unreadCount: 3, latestId: 10 } });

    expect(unreadCount).toBe(3);
    discardPeriodicTasks();
  }));

  it('keeps polling on the interval', fakeAsync(() => {
    loggedIn$.next(true);
    tick();
    http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: { unreadCount: 1, latestId: 1 } });

    tick(POLL_INTERVAL_MS);
    http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: { unreadCount: 2, latestId: 2 } });

    expect(unreadCount).toBe(2);
    discardPeriodicTasks();
  }));

  it('stops polling and clears state on logout', fakeAsync(() => {
    loggedIn$.next(true);
    tick();
    http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: { unreadCount: 2, latestId: 1 } });

    loggedIn$.next(false);
    tick(POLL_INTERVAL_MS * 2);

    http.expectNone(API_URLS.NOTIFICATION_POLL);
    expect(unreadCount).toBe(0);
  }));

  it('ignores a failed poll and keeps the last known count', fakeAsync(() => {
    loggedIn$.next(true);
    tick();
    http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: { unreadCount: 4, latestId: 1 } });

    tick(POLL_INTERVAL_MS);
    http.expectOne(API_URLS.NOTIFICATION_POLL).flush(null, { status: 500, statusText: 'Server Error' });

    expect(unreadCount).toBe(4);
    discardPeriodicTasks();
  }));

  it('reloads the already-open list in the background when a poll reports something new', fakeAsync(() => {
    loggedIn$.next(true);
    tick();
    http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: { unreadCount: 1, latestId: 5 } });
    service.loadFirstPage();
    http.expectOne(request => request.url === API_URLS.MY_NOTIFICATIONS).flush({ list: [notification(5)] });

    tick(POLL_INTERVAL_MS);
    http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: { unreadCount: 2, latestId: 6 } });

    const reload = http.expectOne(request => request.url === API_URLS.MY_NOTIFICATIONS);
    expect(reload.request.context.get(BACKGROUND_REQUEST)).toBeTrue();
    reload.flush({ list: [notification(6), notification(5)] });
    discardPeriodicTasks();
  }));

  it('does not fetch the list when only the unread count changed and the panel was never opened', fakeAsync(() => {
    loggedIn$.next(true);
    tick();
    http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: { unreadCount: 1, latestId: 5 } });

    tick(POLL_INTERVAL_MS);
    http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: { unreadCount: 0, latestId: 5 } });

    http.expectNone(request => request.url === API_URLS.MY_NOTIFICATIONS);
    expect(unreadCount).toBe(0);
    discardPeriodicTasks();
  }));

  describe('toasts for urgent notifications', () => {
    function pollTwice(secondPoll: { unreadCount: number; latestId: number }, firstPoll = { unreadCount: 0, latestId: 5 }): void {
      loggedIn$.next(true);
      tick();
      http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: firstPoll });
      tick(POLL_INTERVAL_MS);
      http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: secondPoll });
    }

    function flushNewestPage(list: AppNotification[]): void {
      http.expectOne(request => request.url === API_URLS.MY_NOTIFICATIONS).flush({ list });
    }

    it('shows a toast for a new urgent notification while the panel is closed', fakeAsync(() => {
      pollTwice({ unreadCount: 1, latestId: 6 });
      flushNewestPage([notification(6)]);

      expect(toast.sendInfoMsg).toHaveBeenCalledOnceWith('message:OFFER_RECEIVED', undefined, 'title:OFFER_RECEIVED');
      discardPeriodicTasks();
    }));

    it('fetches the newest page in the background even if the panel was never opened', fakeAsync(() => {
      pollTwice({ unreadCount: 1, latestId: 6 });

      const request = http.expectOne(request => request.url === API_URLS.MY_NOTIFICATIONS);
      expect(request.request.context.get(BACKGROUND_REQUEST)).toBeTrue();
      request.flush({ list: [] });
      discardPeriodicTasks();
    }));

    it('does not toast for the notifications that were already waiting at sign-in', fakeAsync(() => {
      loggedIn$.next(true);
      tick();
      http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: { unreadCount: 2, latestId: 9 } });

      http.expectNone(request => request.url === API_URLS.MY_NOTIFICATIONS);
      expect(toast.sendInfoMsg).not.toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('does not toast, or fetch anything, while the panel is open and its list was never loaded', fakeAsync(() => {
      service.setPanelOpen(true);
      pollTwice({ unreadCount: 1, latestId: 6 });

      http.expectNone(request => request.url === API_URLS.MY_NOTIFICATIONS);
      expect(toast.sendInfoMsg).not.toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('refreshes an already loaded list but does not toast while the panel is open', fakeAsync(() => {
      loggedIn$.next(true);
      tick();
      http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: { unreadCount: 0, latestId: 5 } });
      service.loadFirstPage();
      flushNewestPage([notification(5, true)]);
      service.setPanelOpen(true);

      tick(POLL_INTERVAL_MS);
      http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: { unreadCount: 1, latestId: 6 } });
      flushNewestPage([notification(6), notification(5, true)]);

      expect(toast.sendInfoMsg).not.toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('does not toast, or fetch anything, while toasts are suppressed (the full-screen test page)', fakeAsync(() => {
      service.setToastsSuppressed(true);
      pollTwice({ unreadCount: 1, latestId: 6 });

      http.expectNone(request => request.url === API_URLS.MY_NOTIFICATIONS);
      expect(toast.sendInfoMsg).not.toHaveBeenCalled();
      expect(unreadCount).toBe(1);
      discardPeriodicTasks();
    }));

    it('toasts only what arrives after suppression is lifted, not what arrived during it', fakeAsync(() => {
      service.setToastsSuppressed(true);
      pollTwice({ unreadCount: 1, latestId: 6 });

      service.setToastsSuppressed(false);
      tick(POLL_INTERVAL_MS);
      http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: { unreadCount: 2, latestId: 7 } });
      flushNewestPage([notification(7), notification(6)]);

      expect(toast.sendInfoMsg).toHaveBeenCalledTimes(1);
      expect(toast.sendInfoMsg).toHaveBeenCalledWith('message:OFFER_RECEIVED', undefined, 'title:OFFER_RECEIVED');
      discardPeriodicTasks();
    }));

    it('does not toast for types that are not urgent, or for items that were already known', fakeAsync(() => {
      pollTwice({ unreadCount: 2, latestId: 7 });
      flushNewestPage([notification(7, false, 'APPLICATION_STATUS_CHANGED'), notification(5)]);

      expect(toast.sendInfoMsg).not.toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('does not toast for an item that is already read', fakeAsync(() => {
      pollTwice({ unreadCount: 0, latestId: 6 });
      flushNewestPage([notification(6, true)]);

      expect(toast.sendInfoMsg).not.toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('shows at most three toasts at once', fakeAsync(() => {
      pollTwice({ unreadCount: 5, latestId: 10 });
      flushNewestPage([10, 9, 8, 7, 6].map(id => notification(id)));

      expect(toast.sendInfoMsg).toHaveBeenCalledTimes(3);
      discardPeriodicTasks();
    }));
  });

  describe('unread filter', () => {
    it('asks the server for unread items only while the filter is on, and drops it when turned off', fakeAsync(() => {
      service.setUnreadOnly(true);
      const filtered = http.expectOne(request => request.url === API_URLS.MY_NOTIFICATIONS);
      expect(filtered.request.params.get('unreadOnly')).toBe('true');
      filtered.flush({ list: [] });

      service.setUnreadOnly(false);
      const unfiltered = http.expectOne(request => request.url === API_URLS.MY_NOTIFICATIONS);
      expect(unfiltered.request.params.has('unreadOnly')).toBeFalse();
      unfiltered.flush({ list: [] });
    }));

    it('keeps the filter when loading more', fakeAsync(() => {
      service.setUnreadOnly(true);
      http.expectOne(request => request.url === API_URLS.MY_NOTIFICATIONS)
        .flush({ list: Array.from({ length: 20 }, (_, index) => notification(40 - index)) });

      service.loadMore();

      const more = http.expectOne(request => request.url === API_URLS.MY_NOTIFICATIONS);
      expect(more.request.params.get('unreadOnly')).toBe('true');
      expect(more.request.params.get('beforeId')).toBe('21');
      more.flush({ list: [] });
    }));

    it('empties the list when everything is marked read while only unread items are shown', fakeAsync(() => {
      service.setUnreadOnly(true);
      http.expectOne(request => request.url === API_URLS.MY_NOTIFICATIONS).flush({ list: [notification(2), notification(1)] });
      let items: AppNotification[] = [];
      service.items$.subscribe(list => items = list);

      service.markAllRead();

      expect(items).toEqual([]);
      expect(unreadCount).toBe(0);
      http.expectOne(API_URLS.READ_ALL_NOTIFICATIONS).flush({});
    }));

    it('goes back to showing everything after sign-out', fakeAsync(() => {
      service.setUnreadOnly(true);
      http.expectOne(request => request.url === API_URLS.MY_NOTIFICATIONS).flush({ list: [] });

      loggedIn$.next(true);
      loggedIn$.next(false);

      let unreadOnly = true;
      service.unreadOnly$.subscribe(value => unreadOnly = value);
      expect(unreadOnly).toBeFalse();
    }));
  });

  it('marks a notification read optimistically and tells the server', fakeAsync(() => {
    loggedIn$.next(true);
    tick();
    http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: { unreadCount: 2, latestId: 2 } });
    service.loadFirstPage();
    http.expectOne(request => request.url === API_URLS.MY_NOTIFICATIONS).flush({ list: [notification(2), notification(1)] });

    let items: AppNotification[] = [];
    service.items$.subscribe(list => items = list);
    service.markRead(items[0]);

    expect(unreadCount).toBe(1);
    expect(items[0].read).toBeTrue();
    const request = http.expectOne('notification/2/read');
    expect(request.request.method).toBe('PUT');
    request.flush({});
    discardPeriodicTasks();
  }));

  it('does not call the server to mark an already-read notification', fakeAsync(() => {
    service.markRead(notification(9, true));

    http.expectNone('notification/9/read');
    expect(unreadCount).toBe(0);
  }));

  it('removes a dismissed unread notification from the list and the count', fakeAsync(() => {
    loggedIn$.next(true);
    tick();
    http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: { unreadCount: 2, latestId: 2 } });
    service.loadFirstPage();
    http.expectOne(request => request.url === API_URLS.MY_NOTIFICATIONS).flush({ list: [notification(2), notification(1)] });

    let items: AppNotification[] = [];
    service.items$.subscribe(list => items = list);
    service.dismiss(items[0]);

    expect(items.map(item => item.id)).toEqual([1]);
    expect(unreadCount).toBe(1);
    const request = http.expectOne('notification/2');
    expect(request.request.method).toBe('DELETE');
    request.flush({});
    discardPeriodicTasks();
  }));

  it('marks everything read', fakeAsync(() => {
    loggedIn$.next(true);
    tick();
    http.expectOne(API_URLS.NOTIFICATION_POLL).flush({ obj: { unreadCount: 2, latestId: 2 } });
    service.loadFirstPage();
    http.expectOne(request => request.url === API_URLS.MY_NOTIFICATIONS).flush({ list: [notification(2), notification(1)] });

    let items: AppNotification[] = [];
    service.items$.subscribe(list => items = list);
    service.markAllRead();

    expect(unreadCount).toBe(0);
    expect(items.every(item => item.read)).toBeTrue();
    http.expectOne(API_URLS.READ_ALL_NOTIFICATIONS).flush({});
    discardPeriodicTasks();
  }));
});
