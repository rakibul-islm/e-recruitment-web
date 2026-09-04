import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

const DEFAULT_LIFE = 5000;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private messageService: MessageService,
    private translate: TranslateService
  ) {}

  // `message` is an i18n key (e.g. "company.createSuccess"), translated here so callers never need
  // to inject TranslateService just to resolve a toast string. `params` interpolates into the key
  // (e.g. { count: 3 }). A plain, already-resolved string (a server error message, say) also works
  // unchanged - translate.instant() falls back to returning its input as-is when it isn't a known key.
  sendSuccessMsg(message: string, params?: object, title?: string) {
    this.messageService.add({ severity: 'success', summary: title || this.translate.instant('common.success'), detail: this.translate.instant(message, params), life: DEFAULT_LIFE });
  }

  sendErrorMsg(message: string, params?: object, title?: string) {
    this.messageService.add({ severity: 'error', summary: title || this.translate.instant('common.error'), detail: this.translate.instant(message, params), life: DEFAULT_LIFE });
  }

  sendWarningMsg(message: string, params?: object, title?: string) {
    this.messageService.add({ severity: 'warn', summary: title || this.translate.instant('common.warning'), detail: this.translate.instant(message, params), life: DEFAULT_LIFE });
  }

  sendInfoMsg(message: string, params?: object, title?: string) {
    this.messageService.add({ severity: 'info', summary: title || this.translate.instant('common.info'), detail: this.translate.instant(message, params), life: DEFAULT_LIFE });
  }
}
