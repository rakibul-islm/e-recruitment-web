import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { SessionService } from '../../../services/session/session.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { SessionSummary, UserSession } from '../../../services/session/domain/session.domain';

@Component({
  selector: 'app-session-search',
  templateUrl: './session.search.component.html'
})
export class SessionSearchComponent extends BaseComponent implements OnInit {
  sessions: UserSession[] = [];
  selectedSession: UserSession | null = null;
  summary: SessionSummary = new SessionSummary();

  filterForm!: FormGroup;

  statusOptions: { label: string; value: boolean | null }[] = [
    { label: 'session.statusAll', value: null },
    { label: 'session.statusActive', value: false },
    { label: 'session.statusRevoked', value: true }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private sessionService: SessionService,
    private commonConfirmDialogService: CommonConfirmDialogService,
    private translate: TranslateService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.prepareForm();
    this.registerFilterForm('session-search-filters', this.filterForm);
    this.fetchSummary();
  }

  prepareForm(): void {
    this.filterForm = this.formBuilder.group({
      revoked: [null],
      ipAddress_like: [''],
      issuedAt_gte: [null],
      issuedAt_lte: [null]
    });
  }

  fetchSummary(): void {
    this.subscribers.summarySub = this.sessionService.getSummary().subscribe(response => {
      this.summary = response?.obj || new SessionSummary();
    });
  }

  fetchSessions(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(this.filterForm, event);

    this.subscribers.searchSessionsSub = this.sessionService.searchSessions(params).subscribe({
      next: (response) => {
        this.sessions = response?.page?.content || [];
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
    this.fetchSessions({ first: 0, rows: this.rows });
  }

  clearFilters(): void {
    this.clearFilterForm(this.filterForm);
  }

  viewSession(session: UserSession): void {
    this.preserveFiltersOnNavigate();
    this.router.navigate(['/sessions', session.id]);
  }

  isSessionActive(session: UserSession): boolean {
    return !session.revoked && new Date(session.expiresAt) > new Date();
  }

  forceLogout(session: UserSession, event: Event): void {
    event.stopPropagation();
    this.commonConfirmDialogService.confirm(
      () => {
        this.subscribers.forceLogoutSub = this.sessionService.forceLogoutSession(session.id).subscribe(() => {
          this.notificationService.sendSuccessMsg(this.translate.instant('session.forceLogoutSuccess'));
          session.revoked = true;
          this.fetchSummary();
        });
      },
      null,
      this.translate.instant('session.forceLogoutConfirm', { name: session.userFullName || session.userEmail })
    );
  }

  forceLogoutAll(): void {
    this.commonConfirmDialogService.confirm(
      () => {
        this.subscribers.forceLogoutAllSub = this.sessionService.forceLogoutAll().subscribe(() => {
          this.notificationService.sendSuccessMsg(this.translate.instant('session.forceLogoutAllSuccess'));
          this.sessions.forEach(s => s.revoked = true);
          this.fetchSummary();
        });
      },
      null,
      this.translate.instant('session.forceLogoutAllConfirm')
    );
  }
}
