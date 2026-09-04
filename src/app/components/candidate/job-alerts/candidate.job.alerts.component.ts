import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseComponent } from '../../base.component';
import { JobAlertService } from '../../../services/job-alert/job.alert.service';
import { JobAlert } from '../../../services/job-alert/domain/job.alert.domain';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';

@Component({
  selector: 'app-candidate-job-alerts',
  templateUrl: './candidate.job.alerts.component.html'
})
export class CandidateJobAlertsComponent extends BaseComponent implements OnInit {
  alerts: JobAlert[] = [];
  alertForm!: FormGroup;
  saving = false;
  createDialogVisible = false;

  constructor(
    private formBuilder: FormBuilder,
    private jobAlertService: JobAlertService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.alertForm = this.formBuilder.group({ keyword: [''], location: [''], category: [''] });
    this.fetchAlerts();
  }

  fetchAlerts(): void {
    this.loading = true;
    this.subscribers.myAlertsSub = this.jobAlertService.myList().subscribe({
      next: (response) => {
        this.alerts = response?.list || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openCreateDialog(): void {
    this.alertForm.reset();
    this.createDialogVisible = true;
  }

  createAlert(): void {
    if (!this.alertForm.value.keyword && !this.alertForm.value.location && !this.alertForm.value.category) {
      this.notificationService.sendErrorMsg('jobAlert.atLeastOneFieldRequired');
      return;
    }
    this.saving = true;
    this.subscribers.saveAlertSub = this.jobAlertService.save({ ...this.alertForm.value, active: true }).subscribe({
      next: () => {
        this.saving = false;
        this.createDialogVisible = false;
        this.notificationService.sendSuccessMsg('jobAlert.createSuccess');
        this.alertForm.reset();
        this.fetchAlerts();
      },
      error: () => { this.saving = false; }
    });
  }

  removeAlert(alert: JobAlert): void {
    this.commonConfirmDialogService.confirm(() => {
      this.subscribers.removeAlertSub = this.jobAlertService.remove(alert.id).subscribe(() => {
        this.notificationService.sendSuccessMsg('jobAlert.removeSuccess');
        this.fetchAlerts();
      });
    });
  }
}
