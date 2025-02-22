import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  sendSuccessMsg(message: string, title: string = 'Success') {
    this.toastr.success(message, title);
  }

  sendErrorMsg(message: string, title: string = 'Error') {
    this.toastr.error(message, title); 
  }

  sendWarningMsg(message: string, title: string = 'Warning') {
    this.toastr.warning(message, title);
  }

  sendInfoMsg(message: string, title: string = 'Info') {
    this.toastr.info(message, title);
  }
}
