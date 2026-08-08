import { Injectable } from '@angular/core';
import { ConfirmationService, Confirmation } from 'primeng/api';

const DEFAULT_OPTIONS: Partial<Confirmation> = {
  header: 'Confirmation',
  icon: 'pi pi-exclamation-triangle',
  acceptLabel: 'Yes',
  rejectLabel: 'No',
  acceptIcon: 'pi pi-check',
  rejectIcon: 'pi pi-times',
  acceptButtonStyleClass: 'p-button-sm',
  rejectButtonStyleClass: 'p-button-sm p-button-outlined p-button-secondary',
  dismissableMask: true
};

@Injectable({
  providedIn: 'root'
})
export class CommonConfirmDialogService {

  constructor(private confirmationService: ConfirmationService) {}

  confirm(accept: () => void, reject?: (() => void) | null, message: string = 'Are you sure that you want to perform this action?', options?: Partial<Confirmation>): void {
    this.confirmationService.confirm({
      ...DEFAULT_OPTIONS,
      message,
      accept,
      reject: reject ?? undefined,
      ...options
    });
  }
}
