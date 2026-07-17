import { Injectable } from '@angular/core';
import { ConfirmationService, Confirmation } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class CommonConfirmDialogService {

  constructor(private confirmationService: ConfirmationService) {}

  confirm(accept: () => void, reject?: () => void, message: string = 'Are you sure that you want to perform this action?', options?: Partial<Confirmation>): void {
    this.confirmationService.confirm({
      message,
      accept,
      reject,
      ...options
    });
  }
}
