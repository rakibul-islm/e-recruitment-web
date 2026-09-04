import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { JobPostingService } from '../../../services/job-posting/job.posting.service';
import { JobPosting } from '../../../services/job-posting/domain/job.posting.domain';
import { SavedJobService } from '../../../services/saved-job/saved.job.service';
import { AuthService } from '../../../services/utility/security/auth.service';

@Component({
  selector: 'app-job-portal-search',
  templateUrl: './job.portal.search.component.html',
  styleUrls: ['./job.portal.search.component.scss']
})
export class JobPortalSearchComponent extends BaseComponent implements OnInit {
  jobPostings: JobPosting[] = [];
  filterForm!: FormGroup;
  isAuthenticated = false;
  savedJobIds = new Set<number>();
  override rows = 9;
  first = 0;

  constructor(
    private formBuilder: FormBuilder,
    private jobPostingService: JobPostingService,
    private savedJobService: SavedJobService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    this.prepareForm();
    this.applyQueryParams();
    this.fetchJobPostings({ first: 0, rows: this.rows });

    this.subscribers.authSub = this.authService.isLoggedIn().subscribe(authenticated => {
      this.isAuthenticated = authenticated;
      if (authenticated) { this.fetchSavedJobIds(); }
    });
  }

  fetchSavedJobIds(): void {
    this.subscribers.savedJobsSub = this.savedJobService.myList().subscribe(response => {
      const list = response?.list || [];
      this.savedJobIds = new Set(list.map((s: any) => s.jobCircularId));
    });
  }

  prepareForm(): void {
    this.filterForm = this.formBuilder.group({
      jobTitle_like: [''],
      jobLocation_like: ['']
    });
  }

  // Lets the public home page's hero search hand off keyword/location via query params.
  applyQueryParams(): void {
    const { jobTitle_like, jobLocation_like } = this.route.snapshot.queryParams;
    if (jobTitle_like || jobLocation_like) {
      this.filterForm.patchValue({ jobTitle_like: jobTitle_like || '', jobLocation_like: jobLocation_like || '' });
    }
  }

  fetchJobPostings(event: TableLazyLoadEvent): void {
    this.loading = true;
    this.first = event.first || 0;
    const params = this.buildSearchParams(this.filterForm, event);
    params.set('status', 'PUBLISHED');

    this.subscribers.searchJobPostingsSub = this.jobPostingService.searchJobPostings(params).subscribe({
      next: (response) => {
        this.jobPostings = response?.page?.content || [];
        this.totalRecords = response?.page?.totalElements || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  search(): void {
    this.fetchJobPostings({ first: 0, rows: this.rows });
  }

  viewJob(job: JobPosting): void {
    this.router.navigate(['/jobs', job.id]);
  }

  toggleSave(job: JobPosting, event: Event): void {
    event.stopPropagation();
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    this.subscribers.toggleSaveSub = this.savedJobService.toggle(job.id).subscribe(response => {
      if (response?.obj?.saved) {
        this.savedJobIds.add(job.id);
      } else {
        this.savedJobIds.delete(job.id);
      }
    });
  }
}
