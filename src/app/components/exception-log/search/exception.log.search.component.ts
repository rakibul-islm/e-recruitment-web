import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { ExceptionLogService } from '../../../services/exception-log/exception.log.service';
import { ExceptionLog } from '../../../services/exception-log/domain/exception.log.domain';

@Component({
  selector: 'app-exception-log-search',
  templateUrl: './exception.log.search.component.html'
})
export class ExceptionLogSearchComponent extends BaseComponent implements OnInit {
  exceptionLogs: ExceptionLog[] = [];
  selectedExceptionLog: ExceptionLog | null = null;

  filterForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private exceptionLogService: ExceptionLogService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.prepareForm();
    this.registerFilterForm('exception-log-search-filters', this.filterForm);
  }

  prepareForm(): void {
    this.filterForm = this.formBuilder.group({
      message: [''],
      requestUri: [''],
      statusCode: [''],
      traceId: [''],
      createdOn_gte: [null],
      createdOn_lte: [null]
    });
  }

  fetchExceptionLogs(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(this.filterForm, event);

    this.subscribers.searchExceptionLogsSub = this.exceptionLogService.searchExceptionLogs(params).subscribe({
      next: (response) => {
        this.exceptionLogs = response?.page?.content || [];
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
    this.fetchExceptionLogs({ first: 0, rows: this.rows });
  }

  clearFilters(): void {
    this.clearFilterForm(this.filterForm);
  }

  viewExceptionLog(exceptionLog: ExceptionLog): void {
    this.preserveFiltersOnNavigate();
    this.router.navigate(['/exception-logs', exceptionLog.id]);
  }
}
