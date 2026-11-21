import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { JobPostingService } from '../../../services/job-posting/job.posting.service';
import { JobPosting } from '../../../services/job-posting/domain/job.posting.domain';
import { SavedJobService } from '../../../services/saved-job/saved.job.service';
import { AuthService } from '../../../services/utility/security/auth.service';
import { JobPortalFilterValue } from '../filter/job.portal.filter.component';

@Component({
  selector: 'app-job-portal-search',
  templateUrl: './job.portal.search.component.html',
  styleUrls: ['./job.portal.search.component.scss']
})
export class JobPortalSearchComponent extends BaseComponent implements OnInit {
  jobPostings: JobPosting[] = [];
  initialFilters: JobPortalFilterValue | null = null;
  isAuthenticated = false;
  savedJobIds = new Set<number>();
  override rows = 9;
  currentPage = 0;
  loadingMore = false;
  private currentFilters: JobPortalFilterValue = {};
  private returningFromDetail = false;
  private searchParams: Map<any, any> | null = null;
  private scrollObserver?: IntersectionObserver;

  constructor(
    private jobPostingService: JobPostingService,
    private savedJobService: SavedJobService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
    this.returningFromDetail = this.router.getCurrentNavigation()?.trigger === 'popstate';
  }

  ngOnInit(): void {
    const restored = this.returningFromDetail ? this.jobPostingService.getListState() : null;
    if (restored) {
      this.jobPostings = restored.jobPostings;
      this.totalRecords = restored.totalRecords;
      this.currentPage = restored.currentPage;
      this.searchParams = restored.searchParams;
      this.currentFilters = restored.filterValue || {};
      this.initialFilters = { ...this.currentFilters };
    } else {
      // Lets the home page's search hand off any filter via query params.
      const queryParams = this.route.snapshot.queryParams;
      this.currentFilters = Object.keys(queryParams).reduce((acc, key) => {
        if (queryParams[key]) { acc[key] = queryParams[key]; }
        return acc;
      }, {} as JobPortalFilterValue);
      this.initialFilters = { ...this.currentFilters };
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

  get hasMore(): boolean {
    return this.jobPostings.length < this.totalRecords;
  }

  onFiltersChanged(filters: JobPortalFilterValue): void {
    this.currentFilters = filters;
    this.fetchJobPostings();
  }

  fetchJobPostings(): void {
    this.loading = true;
    this.currentPage = 0;
    const params = new Map<any, any>();
    params.set('page', 0);
    params.set('size', this.rows);
    params.set('isPageable', true);
    params.set('status', 'PUBLISHED');
    Object.entries(this.currentFilters).forEach(([key, value]) => params.set(key, value));
    this.searchParams = params;

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

  viewJob(job: JobPosting): void {
    this.jobPostingService.saveListState({
      jobPostings: this.jobPostings,
      totalRecords: this.totalRecords,
      currentPage: this.currentPage,
      searchParams: this.searchParams,
      filterValue: this.currentFilters
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
