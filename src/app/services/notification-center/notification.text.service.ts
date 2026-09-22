import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { AppNotification } from './domain/notification.domain';

const DATE_LOCALE = 'en-US';
const DATE_TIME_FORMAT = 'd MMM y, h:mm a';
const DATE_FORMAT = 'd MMM y';

@Injectable({
  providedIn: 'root'
})
export class NotificationTextService {
  constructor(private translate: TranslateService) {}

  title(notification: AppNotification): string {
    return this.text(notification, 'title');
  }

  message(notification: AppNotification): string {
    return this.text(notification, 'message');
  }

  timeAgo(createdOn: string): string {
    const minutes = Math.floor((Date.now() - new Date(createdOn).getTime()) / 60000);
    if (minutes < 1) { return this.translate.instant('notification.time.justNow'); }
    if (minutes < 60) { return this.translate.instant('notification.time.minutesAgo', { count: minutes }); }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) { return this.translate.instant('notification.time.hoursAgo', { count: hours }); }

    const days = Math.floor(hours / 24);
    if (days < 7) { return this.translate.instant('notification.time.daysAgo', { count: days }); }

    return formatDate(createdOn, DATE_FORMAT, DATE_LOCALE);
  }

  private text(notification: AppNotification, part: 'title' | 'message'): string {
    const key = `notification.types.${notification.type}.${part}`;
    const translated = this.translate.instant(key, this.displayParams(notification.params));
    const resolved = translated !== key ? translated : this.translate.instant(`notification.unknown.${part}`);
    return resolved.replace(/\{\{\s*\w+\s*\}\}/g, '').trim();
  }

  private displayParams(params: Record<string, any>): Record<string, any> {
    const result = { ...params };
    Object.keys(result).forEach(name => {
      const format = this.formatFor(name);
      if (format && !isNaN(new Date(result[name]).getTime())) {
        result[name] = formatDate(result[name], format, DATE_LOCALE);
      }
    });
    return result;
  }

  private formatFor(paramName: string): string | null {
    if (paramName.endsWith('At')) { return DATE_TIME_FORMAT; }
    if (paramName.endsWith('Date')) { return DATE_FORMAT; }
    return null;
  }
}
