import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { AuditLogService } from '../../../services/audit-log/audit.log.service';
import { AuditLog } from '../../../services/audit-log/domain/audit.log.domain';

@Component({
  selector: 'app-audit-log-search',
  templateUrl: './audit.log.search.component.html'
})
export class AuditLogSearchComponent extends BaseComponent implements OnInit {
  auditLogs: AuditLog[] = [];
  selectedAuditLog: AuditLog | null = null;

  filterForm!: FormGroup;
  isEntityScoped: boolean = false;
  scopedEntityType: string = '';

  categoryOptions: { label: string; value: string | null }[] = [
    { label: 'auditLog.categoryAll', value: null },
    { label: 'auditLog.categoryEntity', value: 'ENTITY' },
    { label: 'auditLog.categorySecurity', value: 'SECURITY' },
    { label: 'auditLog.categorySystem', value: 'SYSTEM' }
  ];

  outcomeOptions: { label: string; value: string | null }[] = [
    { label: 'auditLog.outcomeAll', value: null },
    { label: 'auditLog.outcomeSuccess', value: 'SUCCESS' },
    { label: 'auditLog.outcomeFailure', value: 'FAILURE' }
  ];

  actionOptions: { label: string; value: string | null }[] = [
    { label: 'auditLog.actionAll', value: null },
    { label: 'auditLog.actionCreate', value: 'CREATE' },
    { label: 'auditLog.actionUpdate', value: 'UPDATE' },
    { label: 'auditLog.actionSoftDelete', value: 'SOFT_DELETE' },
    { label: 'auditLog.actionHardDelete', value: 'HARD_DELETE' },
    { label: 'auditLog.actionLoginSuccess', value: 'LOGIN_SUCCESS' },
    { label: 'auditLog.actionLoginFailure', value: 'LOGIN_FAILURE' },
    { label: 'auditLog.actionLogout', value: 'LOGOUT' },
    { label: 'auditLog.actionForceLogout', value: 'FORCE_LOGOUT' },
    { label: 'auditLog.actionPasswordReset', value: 'PASSWORD_RESET' },
    { label: 'auditLog.actionPasswordSet', value: 'PASSWORD_SET' },
    { label: 'auditLog.actionOtpVerified', value: 'OTP_VERIFIED' },
    { label: 'auditLog.actionOtpFailed', value: 'OTP_FAILED' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private auditLogService: AuditLogService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    this.prepareForm();
    this.registerFilterForm('audit-log-search-filters', this.filterForm);
    this.applyEntityFilterFromRoute();
  }

  applyEntityFilterFromRoute(): void {
    const entityType = this.route.snapshot.queryParamMap.get('entityType');
    const entityId = this.route.snapshot.queryParamMap.get('entityId');
    if (entityType || entityId) {
      this.filterForm.patchValue({ entityType: entityType || '', entityId: entityId || '' });
      this.isEntityScoped = true;
      this.scopedEntityType = this.formatEntityType(entityType || '');
    }
  }

  formatEntityType(entityType: string): string {
    return entityType.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  prepareForm(): void {
    this.filterForm = this.formBuilder.group({
      category_eq: [null],
      action_eq: [null],
      outcome_eq: [null],
      entityType: [''],
      entityId: [''],
      createdBy_eq: [''],
      ipAddress_eq: [''],
      createdOn_gte: [null],
      createdOn_lte: [null]
    });
  }

  fetchAuditLogs(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(this.filterForm, event);

    this.subscribers.searchAuditLogsSub = this.auditLogService.searchAuditLogs(params).subscribe({
      next: (response) => {
        this.auditLogs = response?.page?.content || [];
        this.totalRecords = response?.page?.totalElements || 0;
        this.loading = false;
        if (!this.isEntityScoped) this.activeTabIndex = 1;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  search(table: Table): void {
    table.first = 0;
    this.fetchAuditLogs({ first: 0, rows: this.rows });
  }

  clearFilters(): void {
    this.clearFilterForm(this.filterForm);
  }

  viewAuditLog(auditLog: AuditLog): void {
    this.preserveFiltersOnNavigate();
    this.router.navigate(['/audit-logs', auditLog.id]);
  }
}
