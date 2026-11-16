import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { JobPostingService } from '../../../services/job-posting/job.posting.service';
import { JobNavigationService } from '../../../services/job-posting/job.navigation.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { JobPosting } from '../../../services/job-posting/domain/job.posting.domain';

@Component({
  selector: 'app-job-posting-view',
  templateUrl: './job.posting.view.component.html'
})
export class JobPostingViewComponent extends BaseComponent implements OnInit {
  jobPosting: JobPosting = new JobPosting();
  jobPostingId!: number;
  jobPostingUuid!: string;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private jobPostingService: JobPostingService,
    private jobNavigationService: JobNavigationService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribers.routeSub = this.route.paramMap.subscribe(params => {
      this.jobPostingUuid = params.get('uuid') || '';
      this.jobPosting = new JobPosting();
      this.loading = true;
      this.fetchJobPosting();
    });

  }

  get canNavigate(): boolean {
    return this.jobNavigationService.isNavigable(this.jobPostingUuid);
  }

  get hasPrevious(): boolean {
    return this.jobNavigationService.hasPrevious(this.jobPostingUuid);
  }

  get hasNext(): boolean {
    return this.jobNavigationService.hasNext(this.jobPostingUuid);
  }

  goToPrevious(): void {
    this.jobNavigationService.previous(this.jobPostingUuid).subscribe(uuid => {
      if (uuid) { this.router.navigate(['/job-postings', uuid], { replaceUrl: true }); }
    });
  }

  goToNext(): void {
    this.jobNavigationService.next(this.jobPostingUuid).subscribe(uuid => {
      if (uuid) { this.router.navigate(['/job-postings', uuid], { replaceUrl: true }); }
    });
  }

  fetchJobPosting(): void {
    this.subscribers.findJobPostingSub?.unsubscribe();
    this.subscribers.findJobPostingSub = this.jobPostingService.findJobPostingByUuid(this.jobPostingUuid).subscribe({
      next: response => {
        this.jobPosting = response?.obj;
        this.jobPostingId = this.jobPosting?.id;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  changeStatus(status: string): void {
    if (this.loading) { return; }
    this.commonConfirmDialogService.confirm(() => {
      this.subscribers.updateStatusSub = this.jobPostingService.updateJobPosting({ ...this.jobPosting, status })
        .subscribe(() => {
          this.notificationService.sendSuccessMsg('jobPosting.updateSuccess');
          this.fetchJobPosting();
        });
    });
  }

  deleteJobPosting(): void {
    if (this.loading) { return; }
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
    if (this.loading) { return; }
    this.router.navigate(['/application-management'], { queryParams: { jobCircularId: this.jobPostingId } });
  }
}
