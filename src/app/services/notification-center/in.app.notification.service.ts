import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { BehaviorSubject, EMPTY, Observable, Subscription, catchError, exhaustMap, filter, fromEvent, map, merge, timer } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';
import { BACKGROUND_REQUEST } from '../utility/interceptors/http.context.tokens';
import { AuthService } from '../utility/security/auth.service';
import { NotificationService } from '../utility/notification.service';
import { AppNotification, NotificationPoll, TOAST_NOTIFICATION_TYPES } from './domain/notification.domain';
import { NotificationTextService } from './notification.text.service';

const POLL_INTERVAL_MS = 60000;
const PAGE_SIZE = 20;
const MAX_TOASTS = 3;

@Injectable({
  providedIn: 'root'
})
export class InAppNotificationService extends BaseService {
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  private readonly itemsSubject = new BehaviorSubject<AppNotification[]>([]);
  private readonly hasMoreSubject = new BehaviorSubject<boolean>(false);
  private readonly unreadOnlySubject = new BehaviorSubject<boolean>(false);
  private pollSubscription?: Subscription;
  private latestId: number | null = null;
  private itemsLoaded = false;
  private panelOpen = false;
  private toastsSuppressed = false;

  readonly unreadCount$ = this.unreadCountSubject.asObservable();
  readonly items$ = this.itemsSubject.asObservable();
  readonly hasMore$ = this.hasMoreSubject.asObservable();
  readonly unreadOnly$ = this.unreadOnlySubject.asObservable();

  constructor(http: HttpClient, authService: AuthService, private toast: NotificationService, private text: NotificationTextService) {
    super(http);
    authService.isLoggedIn().subscribe(loggedIn => loggedIn ? this.startPolling() : this.reset());
  }

  public setPanelOpen(open: boolean): void {
    this.panelOpen = open;
  }

  public setToastsSuppressed(suppressed: boolean): void {
    this.toastsSuppressed = suppressed;
  }

  public setUnreadOnly(unreadOnly: boolean): void {
    this.unreadOnlySubject.next(unreadOnly);
    this.loadFirstPage();
  }

  public loadFirstPage(background: boolean = false): void {
    this.fetchPage(null, background).subscribe(page => this.showFirstPage(page));
  }

  public loadMore(): void {
    const items = this.itemsSubject.value;
    if (!items.length) { return; }

    this.fetchPage(items[items.length - 1].id, false).subscribe(page => {
      this.itemsSubject.next([...items, ...page]);
      this.hasMoreSubject.next(page.length >= PAGE_SIZE);
    });
  }

  public markRead(notification: AppNotification): void {
    if (notification.read) { return; }

    this.itemsSubject.next(this.itemsSubject.value.map(item => item.id === notification.id ? { ...item, read: true } : item));
    this.decrementUnread();
    this.put(this.createUrl(API_URLS.READ_NOTIFICATION, { id: notification.id }), {})
      .subscribe({ error: () => this.refresh() });
  }

  public markAllRead(): void {
    if (this.unreadOnlySubject.value) {
      this.itemsSubject.next([]);
      this.hasMoreSubject.next(false);
    } else {
      this.itemsSubject.next(this.itemsSubject.value.map(item => ({ ...item, read: true })));
    }
    this.unreadCountSubject.next(0);
    this.put(API_URLS.READ_ALL_NOTIFICATIONS, {})
      .subscribe({ error: () => this.refresh() });
  }

  public dismiss(notification: AppNotification): void {
    this.itemsSubject.next(this.itemsSubject.value.filter(item => item.id !== notification.id));
    if (!notification.read) { this.decrementUnread(); }
    this.removeById(API_URLS.REMOVE_NOTIFICATION, { id: notification.id })
      .subscribe({ error: () => this.refresh() });
  }

  private refresh(): void {
    this.fetchPoll().subscribe(poll => this.applyPoll(poll));
    this.loadFirstPage();
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollSubscription = merge(timer(0, POLL_INTERVAL_MS), fromEvent(document, 'visibilitychange')).pipe(
      filter(() => !document.hidden),
      exhaustMap(() => this.fetchPoll())
    ).subscribe(poll => this.applyPoll(poll));
  }

  private stopPolling(): void {
    this.pollSubscription?.unsubscribe();
    this.pollSubscription = undefined;
  }

  private reset(): void {
    this.stopPolling();
    this.latestId = null;
    this.itemsLoaded = false;
    this.panelOpen = false;
    this.unreadCountSubject.next(0);
    this.itemsSubject.next([]);
    this.hasMoreSubject.next(false);
    this.unreadOnlySubject.next(false);
  }

  private applyPoll(poll: NotificationPoll): void {
    const previousLatestId = this.latestId;
    const changed = poll.latestId !== previousLatestId || poll.unreadCount !== this.unreadCountSubject.value;
    const hasNewItems = previousLatestId !== null && poll.latestId !== null && poll.latestId > previousLatestId;
    const shouldToast = hasNewItems && !this.panelOpen && !this.toastsSuppressed;
    this.latestId = poll.latestId;
    this.unreadCountSubject.next(poll.unreadCount);

    if (!changed || !(this.itemsLoaded || shouldToast)) { return; }

    this.fetchPage(null, true).subscribe(page => {
      this.showFirstPage(page);
      if (shouldToast) { this.toastNewItems(page, previousLatestId as number); }
    });
  }

  private showFirstPage(page: AppNotification[]): void {
    this.itemsSubject.next(page);
    this.hasMoreSubject.next(page.length >= PAGE_SIZE);
    this.itemsLoaded = true;
  }

  private toastNewItems(page: AppNotification[], previousLatestId: number): void {
    page
      .filter(item => item.id > previousLatestId && !item.read && TOAST_NOTIFICATION_TYPES.includes(item.type))
      .slice(0, MAX_TOASTS)
      .forEach(item => this.toast.sendInfoMsg(this.text.message(item), undefined, this.text.title(item)));
  }

  private decrementUnread(): void {
    this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
  }

  private fetchPoll(): Observable<NotificationPoll> {
    return this.get<any>(API_URLS.NOTIFICATION_POLL, undefined, this.backgroundContext()).pipe(
      map(response => response?.obj as NotificationPoll),
      filter(poll => !!poll),
      catchError(() => EMPTY)
    );
  }

  private fetchPage(beforeId: number | null, background: boolean): Observable<AppNotification[]> {
    const params = new Map<string, any>().set('size', PAGE_SIZE);
    if (beforeId !== null) { params.set('beforeId', beforeId); }
    if (this.unreadOnlySubject.value) { params.set('unreadOnly', true); }

    return this.get<any>(API_URLS.MY_NOTIFICATIONS, params, background ? this.backgroundContext() : undefined).pipe(
      map(response => (response?.list || []) as AppNotification[]),
      catchError(() => EMPTY)
    );
  }

  private backgroundContext(): HttpContext {
    return new HttpContext().set(BACKGROUND_REQUEST, true);
  }
}
