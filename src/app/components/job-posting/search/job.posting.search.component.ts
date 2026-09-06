import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { JobPostingService } from '../../../services/job-posting/job.posting.service';
import { JobPosting, JOB_STATUS_OPTIONS } from '../../../services/job-posting/domain/job.posting.domain';

@Component({
  selector: 'app-job-posting-search',
  templateUrl: './job.posting.search.component.html'
})
export class JobPostingSearchComponent extends BaseComponent implements OnInit {
  jobPostings: JobPosting[] = [];
  selectedJobPosting: JobPosting | null = null;
  statusOptions = [{ label: 'jobPosting.statusAll', value: '' }, ...JOB_STATUS_OPTIONS];

  filterForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private jobPostingService: JobPostingService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.prepareForm();
    this.registerFilterForm('job-posting-search-filters', this.filterForm);
  }

  prepareForm(): void {
    this.filterForm = this.formBuilder.group({
      id: [''],
      jobTitle_like: [''],
      status: ['']
    });
  }

  fetchJobPostings(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(this.filterForm, event);

    this.subscribers.searchJobPostingsSub = this.jobPostingService.searchJobPostings(params).subscribe({
      next: (response) => {
        this.jobPostings = response?.page?.content || [];
        this.totalRecords = response?.page?.totalElements || 0;
        this.loading = false;
        this.activeTabIndex = 1;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  search(table: Table): void {
    table.first = 0;
    this.fetchJobPostings({ first: 0, rows: this.rows });
  }

  clearFilters(): void {
    this.clearFilterForm(this.filterForm);
  }

  createJobPosting(): void {
    this.clearFilters();
    this.router.navigate(['/job-postings/create']);
  }

  viewJobPosting(jobPosting: JobPosting): void {
    this.preserveFiltersOnNavigate();
    this.router.navigate(['/job-postings', jobPosting.id]);
  }
}
