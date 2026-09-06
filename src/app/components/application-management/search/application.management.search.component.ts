import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { ApplicationService } from '../../../services/application/application.service';
import { Application, APPLICATION_STATUS_OPTIONS } from '../../../services/application/domain/application.domain';

@Component({
  selector: 'app-application-management-search',
  templateUrl: './application.management.search.component.html'
})
export class ApplicationManagementSearchComponent extends BaseComponent implements OnInit {
  applications: Application[] = [];
  selectedApplication: Application | null = null;
  statusOptions = [{ label: 'jobPosting.statusAll', value: '' }, ...APPLICATION_STATUS_OPTIONS];

  filterForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private applicationService: ApplicationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    const jobCircularId = this.route.snapshot.queryParamMap.get('jobCircularId') || '';
    this.prepareForm(jobCircularId);
  }

  prepareForm(jobCircularId: string): void {
    this.filterForm = this.formBuilder.group({
      jobCircularId: [jobCircularId],
      candidateName_like: [''],
      candidateEmail_like: [''],
      status: [''],
      appliedOn_gte: [null],
      appliedOn_lte: [null]
    });
  }

  fetchApplications(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(this.filterForm, event);

    this.subscribers.searchApplicationsSub = this.applicationService.searchApplications(params).subscribe({
      next: (response) => {
        this.applications = response?.page?.content || [];
        this.totalRecords = response?.page?.totalElements || 0;
        this.loading = false;
        this.activeTabIndex = 1;
      },
      error: () => { this.loading = false; }
    });
  }

  search(table: Table): void {
    table.first = 0;
    this.fetchApplications({ first: 0, rows: this.rows });
  }

  clearFilters(): void {
    this.filterForm.reset({
      jobCircularId: '',
      candidateName_like: '',
      candidateEmail_like: '',
      status: '',
      appliedOn_gte: null,
      appliedOn_lte: null
    });
  }

  viewApplication(application: Application): void {
    this.router.navigate(['/application-management', application.id]);
  }
}
