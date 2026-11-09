import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { JobPostingService } from '../../../services/job-posting/job.posting.service';
import { ApplicationService } from '../../../services/application/application.service';
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
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    super();
  }

  ngOnInit(): void {
    this.jobUuid = this.route.snapshot.paramMap.get('uuid') || '';
    this.applyForm = this.formBuilder.group({ coverLetter: [''] });

    this.subscribers.authSub = this.authService.isLoggedIn().subscribe(authenticated => {
      this.isAuthenticated = authenticated;
    });

    this.fetchJob();
  }

  get applicationsClosed(): boolean {
    if (!this.job?.applicationDeadLine) { return false; }
    const deadline = new Date(this.job.applicationDeadLine);
    return Date.now() >= new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate() + 1).getTime();
  }

  fetchJob(): void {
    this.subscribers.findJobSub = this.jobPostingService.findJobPostingByUuid(this.jobUuid).subscribe(response => {
      this.job = response?.obj;
      this.jobId = this.job?.id;
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
