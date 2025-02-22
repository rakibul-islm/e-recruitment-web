import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmationService } from '../../../services/utility/confirmation.service';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation.dialog.component.html'
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {
  isVisible = false;
  message = '';
  acceptFunction: Function | null = null;
  rejectFunction: Function | null = null;
  private confirmationSubscription!: Subscription;

  constructor(private confirmDialogService: ConfirmationService) {}

  ngOnInit() {
    // Listen to the confirmation dialog trigger
    this.confirmationSubscription = this.confirmDialogService.confirmation$.subscribe(data => {
      this.message = data.message;
      this.acceptFunction = data.accept;
      this.rejectFunction = data.reject || null;
      this.isVisible = true;
    });
  }

  ngOnDestroy() {
    // Clean up subscription to avoid memory leaks
    if (this.confirmationSubscription) {
      this.confirmationSubscription.unsubscribe();
    }
  }

  onAccept() {
    if (this.acceptFunction) {
      this.acceptFunction();
    }
    this.closeDialog();
  }

  onReject() {
    if (this.rejectFunction) {
      this.rejectFunction();
    }
    this.closeDialog();
  }

  closeDialog() {
    this.isVisible = false;
  }
}
