import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { JobPostingService } from '../../../services/job-posting/job.posting.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { JobPosting } from '../../../services/job-posting/domain/job.posting.domain';

@Component({
  selector: 'app-job-posting-view',
  templateUrl: './job.posting.view.component.html'
})
export class JobPostingViewComponent extends BaseComponent implements OnInit {
  jobPosting: JobPosting = new JobPosting();
  jobPostingId!: number;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private jobPostingService: JobPostingService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.jobPostingId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchJobPosting();
  }

  fetchJobPosting(): void {
    this.subscribers.findJobPostingSub = this.jobPostingService.findJobPostingById(this.jobPostingId).subscribe(response => {
      this.jobPosting = response?.obj;
    });
  }

  changeStatus(status: string): void {
    this.commonConfirmDialogService.confirm(() => {
      this.subscribers.updateStatusSub = this.jobPostingService.updateJobPosting({ ...this.jobPosting, status })
        .subscribe(() => {
          this.notificationService.sendSuccessMsg('jobPosting.updateSuccess');
          this.fetchJobPosting();
        });
    });
  }

  deleteJobPosting(): void {
    this.commonConfirmDialogService.confirm(
      () => {
        this.subscribers.deleteJobPostingSub = this.jobPostingService.deleteJobPosting(this.jobPostingId).subscribe(() => {
          this.notificationService.sendSuccessMsg('jobPosting.deleteSuccess');
          this.navigateToSearch();
        });
      },
      null,
      'jobPosting.deleteConfirm', { title: this.jobPosting.jobTitle }
    );
  }

  navigateToSearch(): void {
    this.router.navigate(['/job-postings']);
  }

  viewApplications(): void {
    this.router.navigate(['/application-management'], { queryParams: { jobCircularId: this.jobPostingId } });
  }
}
