import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

const DEFAULT_LIFE = 5000;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private messageService: MessageService) {}

  sendSuccessMsg(message: string, title: string = 'Success') {
    this.messageService.add({ severity: 'success', summary: title, detail: message, life: DEFAULT_LIFE });
  }

  sendErrorMsg(message: string, title: string = 'Error') {
    this.messageService.add({ severity: 'error', summary: title, detail: message, life: DEFAULT_LIFE });
  }

  sendWarningMsg(message: string, title: string = 'Warning') {
    this.messageService.add({ severity: 'warn', summary: title, detail: message, life: DEFAULT_LIFE });
  }

  sendInfoMsg(message: string, title: string = 'Info') {
    this.messageService.add({ severity: 'info', summary: title, detail: message, life: DEFAULT_LIFE });
  }
}
