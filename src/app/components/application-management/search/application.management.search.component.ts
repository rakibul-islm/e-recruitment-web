import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { ApplicationService } from '../../../services/application/application.service';
import { Application, APPLICATION_STATUS_OPTIONS } from '../../../services/application/domain/application.domain';
import { McqTestAssignmentService } from '../../../services/mcq-test-assignment/mcq.test.assignment.service';
import { McqTestService } from '../../../services/mcq-test/mcq.test.service';
import { McqTest } from '../../../services/mcq-test/domain/mcq.test.domain';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';

@Component({
  selector: 'app-application-management-search',
  templateUrl: './application.management.search.component.html'
})
export class ApplicationManagementSearchComponent extends BaseComponent implements OnInit {
  applications: Application[] = [];
  selectedApplication: Application | null = null;
  selectedApplications: Application[] = [];
  statusOptions = [{ label: 'jobPosting.statusAll', value: '' }, ...APPLICATION_STATUS_OPTIONS];

  filterForm!: FormGroup;

  activeTestOptions: { label: string; value: number }[] = [];
  bulkAssignDialogVisible = false;
  bulkAssignForm!: FormGroup;
  bulkAssigning = false;

  constructor(
    private formBuilder: FormBuilder,
    private applicationService: ApplicationService,
    private mcqTestAssignmentService: McqTestAssignmentService,
    private mcqTestService: McqTestService,
    private commonConfirmDialogService: CommonConfirmDialogService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    const jobCircularId = this.route.snapshot.queryParamMap.get('jobCircularId') || '';
    this.prepareForm(jobCircularId);
    this.bulkAssignForm = this.formBuilder.group({ mcqTestId: [null, Validators.required], scheduledAt: [null], scheduledEndAt: [null] });
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

  // Bulk-select is independent of the table's own single-selection-to-view (selectedApplication) -
  // plain checkboxes + a manual array, not PrimeNG's [(selection)]/p-tableCheckbox pairing, since
  // that pairing is already used by the single-select-to-view behavior on the same p-table.
  isSelected(application: Application): boolean {
    return this.selectedApplications.some(a => a.id === application.id);
  }

  toggleSelection(application: Application): void {
    this.selectedApplications = this.isSelected(application)
      ? this.selectedApplications.filter(a => a.id !== application.id)
      : [...this.selectedApplications, application];
  }

  allSelected(): boolean {
    return this.applications.length > 0 && this.applications.every(a => this.isSelected(a));
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      const toAdd = this.applications.filter(a => !this.isSelected(a));
      this.selectedApplications = [...this.selectedApplications, ...toAdd];
    } else {
      const currentPageIds = new Set(this.applications.map(a => a.id));
      this.selectedApplications = this.selectedApplications.filter(a => !currentPageIds.has(a.id));
    }
  }

  openBulkAssign(): void {
    this.bulkAssignForm.reset();
    this.subscribers.activeTestsSub = this.mcqTestService
      .searchTests(new Map<any, any>().set('status', 'ACTIVE').set('isPageable', false))
      .subscribe(response => {
        const tests: McqTest[] = response?.list || [];
        this.activeTestOptions = tests.map(t => ({ label: t.name, value: t.id }));
      });
    this.bulkAssignDialogVisible = true;
  }

  confirmBulkAssign(): void {
    if (this.isFormInvalid(this.bulkAssignForm)) { return; }
    const raw = this.bulkAssignForm.getRawValue();
    if (raw.scheduledAt && raw.scheduledEndAt && new Date(raw.scheduledEndAt) <= new Date(raw.scheduledAt)) {
      this.notificationService.sendErrorMsg('mcqTest.endBeforeStartError');
      return;
    }

    this.commonConfirmDialogService.confirm(
      () => this.bulkAssign(raw),
      null,
      'applicationManagement.assignToSelectedConfirm',
      { count: this.selectedApplications.length }
    );
  }

  bulkAssign(raw: any): void {
    this.bulkAssigning = true;
    this.subscribers.bulkAssignSub = this.mcqTestAssignmentService.bulkAssign({
      applicationIds: this.selectedApplications.map(a => a.id),
      mcqTestId: raw.mcqTestId,
      scheduledAt: raw.scheduledAt,
      scheduledEndAt: raw.scheduledEndAt
    }).subscribe({
      next: (response) => {
        this.bulkAssigning = false;
        this.bulkAssignDialogVisible = false;
        this.notificationService.sendSuccessMsg(response?.message || 'applicationManagement.bulkAssignSuccess');
        this.selectedApplications = [];
      },
      error: () => { this.bulkAssigning = false; }
    });
  }
}
