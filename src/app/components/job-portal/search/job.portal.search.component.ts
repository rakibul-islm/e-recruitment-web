import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { JobPostingService } from '../../../services/job-posting/job.posting.service';
import { JobPosting } from '../../../services/job-posting/domain/job.posting.domain';
import { JobNavigationService } from '../../../services/job-posting/job.navigation.service';
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
  currentPage = 0;
  loadingMore = false;
  private returningFromDetail = false;
  private searchParams: Map<any, any> | null = null;
  private scrollObserver?: IntersectionObserver;

  constructor(
    private formBuilder: FormBuilder,
    private jobPostingService: JobPostingService,
    private savedJobService: SavedJobService,
    private jobNavigationService: JobNavigationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
    this.returningFromDetail = this.router.getCurrentNavigation()?.trigger === 'popstate';
  }

  ngOnInit(): void {
    this.prepareForm();

    const restored = this.returningFromDetail ? this.jobNavigationService.getListState() : null;
    if (restored) {
      this.jobPostings = restored.jobPostings;
      this.totalRecords = restored.totalRecords;
      this.currentPage = restored.currentPage;
      this.searchParams = restored.searchParams;
      this.filterForm.patchValue(restored.filterValue);
    } else {
      this.applyQueryParams();
      this.fetchJobPostings();
    }

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

  get hasMore(): boolean {
    return this.jobPostings.length < this.totalRecords;
  }

  fetchJobPostings(): void {
    this.loading = true;
    this.currentPage = 0;
    const params = this.buildSearchParams(this.filterForm, { first: 0, rows: this.rows });
    params.set('status', 'PUBLISHED');
    this.searchParams = params;

    this.subscribers.searchJobPostingsSub = this.jobPostingService.searchJobPostings(params).subscribe({
      next: (response) => {
        this.jobPostings = response?.page?.content || [];
        this.totalRecords = response?.page?.totalElements || 0;
        this.jobNavigationService.remember(params, this.jobPostings.map(j => j.uuid), this.totalRecords);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadMore(): void {
    if (this.loading || this.loadingMore || !this.hasMore || !this.searchParams) { return; }
    this.loadingMore = true;
    const page = this.currentPage + 1;
    const params = new Map(this.searchParams);
    params.set('page', page);

    this.subscribers.loadMoreSub = this.jobPostingService.searchJobPostings(params).subscribe({
      next: (response) => {
        const content: JobPosting[] = response?.page?.content || [];
        this.jobPostings = [...this.jobPostings, ...content];
        this.totalRecords = response?.page?.totalElements || 0;
        this.currentPage = page;
        this.jobNavigationService.remember(params, content.map(j => j.uuid), this.totalRecords, true);
        this.loadingMore = false;
      },
      error: () => {
        this.loadingMore = false;
      }
    });
  }

  @ViewChild('scrollSentinel') set scrollSentinel(element: ElementRef | undefined) {
    this.scrollObserver?.disconnect();
    if (!element) { return; }
    this.scrollObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { this.loadMore(); }
    }, { rootMargin: '300px' });
    this.scrollObserver.observe(element.nativeElement);
  }

  override ngOnDestroy(): void {
    this.scrollObserver?.disconnect();
    super.ngOnDestroy();
  }

  search(): void {
    this.fetchJobPostings();
  }

  viewJob(job: JobPosting): void {
    this.jobNavigationService.saveListState({
      jobPostings: this.jobPostings,
      totalRecords: this.totalRecords,
      currentPage: this.currentPage,
      searchParams: this.searchParams,
      filterValue: this.filterForm.value
    });
    this.router.navigate(['/jobs', job.uuid]);
  }

  goBackFromJobs(): void {
    this.router.navigate([this.isAuthenticated ? '/dashboard' : '/']);
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
