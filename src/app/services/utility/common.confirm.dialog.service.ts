import { Injectable } from '@angular/core';
import { ConfirmationService, Confirmation } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class CommonConfirmDialogService {

  constructor(
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) {}

  confirm(accept: () => void, reject?: (() => void) | null, message?: string, options?: Partial<Confirmation>): void {
    this.confirmationService.confirm({
      header: this.translate.instant('common.confirmation'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('common.yes'),
      rejectLabel: this.translate.instant('common.no'),
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-sm',
      rejectButtonStyleClass: 'p-button-sm p-button-outlined p-button-secondary',
      dismissableMask: true,
      message: message || this.translate.instant('common.confirmDefaultMessage'),
      accept,
      reject: reject ?? undefined,
      ...options
    });
  }
}
