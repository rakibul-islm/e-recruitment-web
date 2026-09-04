import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { RecruiterApplicationService } from '../../../services/recruiter-application/recruiter.application.service';
import { RecruiterApplication } from '../../../services/recruiter-application/domain/recruiter.application.domain';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';

@Component({
  selector: 'app-recruiter-application-view',
  templateUrl: './recruiter.application.view.component.html'
})
export class RecruiterApplicationViewComponent extends BaseComponent implements OnInit {
  application: RecruiterApplication = new RecruiterApplication();
  applicationId!: number;

  rejectDialogVisible = false;
  rejectForm!: FormGroup;
  processing = false;

  constructor(
    private route: ActivatedRoute,
    private recruiterApplicationService: RecruiterApplicationService,
    private commonConfirmDialogService: CommonConfirmDialogService,
    private formBuilder: FormBuilder
  ) {
    super();
  }

  ngOnInit(): void {
    this.applicationId = Number(this.route.snapshot.paramMap.get('id'));
    this.rejectForm = this.formBuilder.group({ note: [''] });
    this.fetchApplication();
  }

  fetchApplication(): void {
    this.loading = true;
    this.subscribers.findApplicationSub = this.recruiterApplicationService.findById(this.applicationId).subscribe({
      next: (response) => {
        this.application = response?.obj || new RecruiterApplication();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  approve(): void {
    this.commonConfirmDialogService.confirm(() => {
      this.processing = true;
      this.subscribers.approveSub = this.recruiterApplicationService.approve(this.applicationId).subscribe({
        next: () => {
          this.processing = false;
          this.notificationService.sendSuccessMsg('recruiterApplication.approveSuccess');
          this.fetchApplication();
        },
        error: () => { this.processing = false; }
      });
    }, null, 'recruiterApplication.approveConfirm');
  }

  openReject(): void {
    this.rejectForm.reset();
    this.rejectDialogVisible = true;
  }

  reject(): void {
    this.processing = true;
    const { note } = this.rejectForm.getRawValue();
    this.subscribers.rejectSub = this.recruiterApplicationService.reject(this.applicationId, note).subscribe({
      next: () => {
        this.processing = false;
        this.rejectDialogVisible = false;
        this.notificationService.sendSuccessMsg('recruiterApplication.rejectSuccess');
        this.fetchApplication();
      },
      error: () => { this.processing = false; }
    });
  }
}
