import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { JobPostingService } from '../../../services/job-posting/job.posting.service';
import { ApplicationService } from '../../../services/application/application.service';
import { JobNavigationService } from '../../../services/job-posting/job.navigation.service';
import { AuthService } from '../../../services/utility/security/auth.service';
import { JobPosting } from '../../../services/job-posting/domain/job.posting.domain';

@Component({
  selector: 'app-job-portal-view',
  templateUrl: './job.portal.view.component.html',
  styleUrls: ['./job.portal.view.component.scss']
})
export class JobPortalViewComponent extends BaseComponent implements OnInit {
  job: JobPosting = new JobPosting();
  jobId!: number;
  jobUuid!: string;
  isAuthenticated = false;

  applyDialogVisible = false;
  applyForm!: FormGroup;
  submitting = false;
  alreadyApplied = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobPostingService: JobPostingService,
    private applicationService: ApplicationService,
    private jobNavigationService: JobNavigationService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    super();
  }

  ngOnInit(): void {
    this.applyForm = this.formBuilder.group({ coverLetter: [''] });

    this.subscribers.authSub = this.authService.isLoggedIn().subscribe(authenticated => {
      this.isAuthenticated = authenticated;
    });

    this.subscribers.routeSub = this.route.paramMap.subscribe(params => {
      this.jobUuid = params.get('uuid') || '';
      this.alreadyApplied = false;
      this.loading = true;
      this.fetchJob();
    });

  }

  get canNavigate(): boolean {
    return this.jobNavigationService.isNavigable(this.jobUuid);
  }

  get hasPrevious(): boolean {
    return this.jobNavigationService.hasPrevious(this.jobUuid);
  }

  get hasNext(): boolean {
    return this.jobNavigationService.hasNext(this.jobUuid);
  }

  goToPrevious(): void {
    this.jobNavigationService.previous(this.jobUuid).subscribe(uuid => {
      if (uuid) { this.router.navigate(['/jobs', uuid], { replaceUrl: true }); }
    });
  }

  goToNext(): void {
    this.jobNavigationService.next(this.jobUuid).subscribe(uuid => {
      if (uuid) { this.router.navigate(['/jobs', uuid], { replaceUrl: true }); }
    });
  }

  get applicationsClosed(): boolean {
    if (!this.job?.applicationDeadLine) { return false; }
    const deadline = new Date(this.job.applicationDeadLine);
    return Date.now() >= new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate() + 1).getTime();
  }

  fetchJob(): void {
    this.subscribers.findJobSub?.unsubscribe();
    this.subscribers.findJobSub = this.jobPostingService.findJobPostingByUuid(this.jobUuid).subscribe({
      next: response => {
        this.job = response?.obj;
        this.jobId = this.job?.id;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openApply(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/jobs/${this.jobUuid}` } });
      return;
    }
    this.applyDialogVisible = true;
  }

  submitApplication(): void {
    this.submitting = true;
    this.subscribers.applySub = this.applicationService.apply({
      jobCircularId: this.jobId,
      coverLetter: this.applyForm.value.coverLetter,
      useLatestGeneratedCv: true
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.applyDialogVisible = false;
        this.alreadyApplied = true;
        this.notificationService.sendSuccessMsg('jobPortal.applySuccess');
      },
      error: () => {
        this.submitting = false;
      }
    });
  }
}
