import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../../../base.component';
import { InAppNotificationService } from '../../../../services/notification-center/in.app.notification.service';
import { NotificationTextService } from '../../../../services/notification-center/notification.text.service';
import { AppNotification, DEFAULT_NOTIFICATION_ICON, NOTIFICATION_TYPE_ICONS } from '../../../../services/notification-center/domain/notification.domain';

@Component({
  selector: 'app-notification-view',
  templateUrl: './notification.view.component.html',
  styleUrls: ['./notification.view.component.scss']
})
export class NotificationViewComponent extends BaseComponent implements OnInit {
  notification: AppNotification | null = null;
  notFound = false;

  constructor(
    private route: ActivatedRoute,
    private inAppNotificationService: InAppNotificationService,
    private notificationText: NotificationTextService
  ) {
    super();
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.subscribers.findNotificationSub = this.inAppNotificationService.findById(id).subscribe(notification => {
      this.notification = notification;
      this.notFound = !notification;
      if (notification) { this.inAppNotificationService.markRead(notification); }
    });
  }

  icon(): string {
    return this.notification ? (NOTIFICATION_TYPE_ICONS[this.notification.type] || DEFAULT_NOTIFICATION_ICON) : DEFAULT_NOTIFICATION_ICON;
  }

  title(): string {
    return this.notification ? this.notificationText.title(this.notification) : '';
  }

  message(): string {
    return this.notification ? this.notificationText.message(this.notification) : '';
  }

  timeAgo(): string {
    return this.notification ? this.notificationText.timeAgo(this.notification.createdOn) : '';
  }
}
