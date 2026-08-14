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

  sendSuccessMsg(message: string, title?: string) {
    this.messageService.add({ severity: 'success', summary: title || this.translate.instant('common.success'), detail: message, life: DEFAULT_LIFE });
  }

  sendErrorMsg(message: string, title?: string) {
    this.messageService.add({ severity: 'error', summary: title || this.translate.instant('common.error'), detail: message, life: DEFAULT_LIFE });
  }

  sendWarningMsg(message: string, title?: string) {
    this.messageService.add({ severity: 'warn', summary: title || this.translate.instant('common.warning'), detail: message, life: DEFAULT_LIFE });
  }

  sendInfoMsg(message: string, title?: string) {
    this.messageService.add({ severity: 'info', summary: title || this.translate.instant('common.info'), detail: message, life: DEFAULT_LIFE });
  }
}
