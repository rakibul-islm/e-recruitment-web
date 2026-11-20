import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../base.component';
import { AuthService } from '../../services/utility/security/auth.service';
import { JobPostingService } from '../../services/job-posting/job.posting.service';
import { JobPosting } from '../../services/job-posting/domain/job.posting.domain';
import { OrganizationService } from '../../services/organization/organization.service';
import { JobPortalFilterValue } from '../job-portal/filter/job.portal.filter.component';

const FEATURED_JOBS_LIMIT = 6;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends BaseComponent implements OnInit {
  featuredJobs: JobPosting[] = [];
  openJobsCount = 0;
  organizationsCount = 0;

  constructor(
    private authService: AuthService,
    private jobPostingService: JobPostingService,
    private organizationService: OrganizationService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribers.authSub = this.authService.isLoggedIn().subscribe(authenticated => {
      if (authenticated) { this.router.navigate(['/dashboard']); }
    });

    this.fetchStats();
    this.fetchFeaturedJobs();
  }

  searchJobs(filters: JobPortalFilterValue): void {
    this.router.navigate(['/jobs'], { queryParams: { ...filters } });
  }

  viewJob(job: JobPosting): void {
    this.router.navigate(['/jobs', job.uuid]);
  }

  private fetchStats(): void {
    // The open-jobs count comes from fetchFeaturedJobs(): same status filter, and its page already carries totalElements.
    const organizationsParams = new Map<any, any>().set('isPageable', true).set('page', 0).set('size', 1);
    this.subscribers.organizationsCountSub = this.organizationService.searchOrganizations(organizationsParams).subscribe(response => {
      this.organizationsCount = response?.page?.totalElements || 0;
    });
  }

  private fetchFeaturedJobs(): void {
    this.loading = true;
    const params = new Map<any, any>()
      .set('status', 'PUBLISHED')
      .set('isPageable', true)
      .set('page', 0)
      .set('size', FEATURED_JOBS_LIMIT)
      .set('sort', 'id,desc');

    this.subscribers.featuredJobsSub = this.jobPostingService.searchJobPostings(params).subscribe({
      next: (response) => {
        this.featuredJobs = response?.page?.content || [];
        this.openJobsCount = response?.page?.totalElements || 0;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
