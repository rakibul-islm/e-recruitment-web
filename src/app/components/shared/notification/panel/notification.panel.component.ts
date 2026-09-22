import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { InAppNotificationService } from '../../../../services/notification-center/in.app.notification.service';
import { NotificationTextService } from '../../../../services/notification-center/notification.text.service';
import { AppNotification, DEFAULT_NOTIFICATION_ICON, NOTIFICATION_TYPE_ICONS } from '../../../../services/notification-center/domain/notification.domain';

const MAX_BADGE_COUNT = 99;

@Component({
  selector: 'app-notification-panel',
  templateUrl: './notification.panel.component.html',
  styleUrls: ['./notification.panel.component.scss']
})
export class NotificationPanelComponent implements OnDestroy {
  visible = false;
  readonly unreadCount$: Observable<number>;
  readonly items$: Observable<AppNotification[]>;
  readonly hasMore$: Observable<boolean>;
  readonly unreadOnly$: Observable<boolean>;

  constructor(
    private notificationService: InAppNotificationService,
    private notificationText: NotificationTextService,
    private router: Router) {
    this.unreadCount$ = notificationService.unreadCount$;
    this.items$ = notificationService.items$;
    this.hasMore$ = notificationService.hasMore$;
    this.unreadOnly$ = notificationService.unreadOnly$;
  }

  ngOnDestroy(): void {
    this.notificationService.setPanelOpen(false);
  }

  toggle(): void {
    this.visible ? this.close() : this.open();
  }

  open(): void {
    this.setVisible(true);
    this.notificationService.loadFirstPage();
  }

  close(): void {
    this.setVisible(false);
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    this.notificationService.setPanelOpen(visible);
  }

  select(notification: AppNotification): void {
    this.notificationService.markRead(notification);
    this.close();

    const route = notification.actionRoute;
    if (route && route.startsWith('/') && !route.startsWith('//')) {
      this.router.navigateByUrl(route);
      return;
    }

    this.router.navigate(['/notifications', notification.id]);
  }

  setUnreadOnly(unreadOnly: boolean): void {
    this.notificationService.setUnreadOnly(unreadOnly);
  }

  markAllRead(): void {
    this.notificationService.markAllRead();
  }

  dismiss(notification: AppNotification): void {
    this.notificationService.dismiss(notification);
  }

  loadMore(): void {
    this.notificationService.loadMore();
  }

  trackById(_index: number, notification: AppNotification): number {
    return notification.id;
  }

  badgeText(count: number | null): string {
    return (count ?? 0) > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(count ?? 0);
  }

  icon(notification: AppNotification): string {
    return NOTIFICATION_TYPE_ICONS[notification.type] || DEFAULT_NOTIFICATION_ICON;
  }

  text(notification: AppNotification, part: 'title' | 'message'): string {
    return part === 'title' ? this.notificationText.title(notification) : this.notificationText.message(notification);
  }

  timeAgo(createdOn: string): string {
    return this.notificationText.timeAgo(createdOn);
  }
}
