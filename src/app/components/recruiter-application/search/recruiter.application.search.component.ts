import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { RecruiterApplicationService } from '../../../services/recruiter-application/recruiter.application.service';
import { RecruiterApplication, RECRUITER_APPLICATION_STATUS_OPTIONS } from '../../../services/recruiter-application/domain/recruiter.application.domain';

@Component({
  selector: 'app-recruiter-application-search',
  templateUrl: './recruiter.application.search.component.html'
})
export class RecruiterApplicationSearchComponent extends BaseComponent implements OnInit {
  applications: RecruiterApplication[] = [];
  selectedApplication: RecruiterApplication | null = null;
  filterForm!: FormGroup;

  statusOptions: { label: string; value: string | null }[] = [
    { label: 'recruiterApplication.statusAll', value: null },
    ...RECRUITER_APPLICATION_STATUS_OPTIONS
  ];

  constructor(
    private formBuilder: FormBuilder,
    private recruiterApplicationService: RecruiterApplicationService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.prepareForm();
    this.registerFilterForm('recruiter-application-search-filters', this.filterForm);
  }

  prepareForm(): void {
    this.filterForm = this.formBuilder.group({
      fullName_like: [''],
      companyName_like: [''],
      status: ['PENDING']
    });
  }

  fetchApplications(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(this.filterForm, event);

    this.subscribers.searchApplicationsSub = this.recruiterApplicationService.searchApplications(params).subscribe({
      next: (response) => {
        this.applications = response?.page?.content || [];
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
    this.fetchApplications({ first: 0, rows: this.rows });
  }

  clearFilters(): void {
    this.clearFilterForm(this.filterForm);
  }

  viewApplication(application: RecruiterApplication): void {
    this.preserveFiltersOnNavigate();
    this.router.navigate(['/recruiter-applications', application.id]);
  }
}
