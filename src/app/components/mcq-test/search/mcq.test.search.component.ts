import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TableLazyLoadEvent, Table } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { McqTestService } from '../../../services/mcq-test/mcq.test.service';
import { McqTest, MCQ_TEST_STATUS_OPTIONS } from '../../../services/mcq-test/domain/mcq.test.domain';

@Component({
  selector: 'app-mcq-test-search',
  templateUrl: './mcq.test.search.component.html'
})
export class McqTestSearchComponent extends BaseComponent implements OnInit {
  tests: McqTest[] = [];
  selectedTest: McqTest | null = null;
  statusOptions = [{ label: 'common.all', value: '' }, ...MCQ_TEST_STATUS_OPTIONS];

  filterForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private mcqTestService: McqTestService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.prepareForm();
    this.registerFilterForm('mcq-test-search-filters', this.filterForm);
  }

  prepareForm(): void {
    this.filterForm = this.formBuilder.group({
      name_like: [''],
      status: ['']
    });
  }

  fetchTests(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(this.filterForm, event);

    this.subscribers.searchTestsSub = this.mcqTestService.searchTests(params).subscribe({
      next: (response) => {
        this.tests = response?.page?.content || [];
        this.totalRecords = response?.page?.totalElements || 0;
        this.loading = false;
        this.activeTabIndex = 1;
      },
      error: () => { this.loading = false; }
    });
  }

  search(table: Table): void {
    table.first = 0;
    this.fetchTests({ first: 0, rows: this.rows });
  }

  clearFilters(): void {
    this.clearFilterForm(this.filterForm);
  }

  createTest(): void {
    this.clearFilters();
    this.router.navigate(['/mcq-tests/create']);
  }

  viewTest(test: McqTest): void {
    this.preserveFiltersOnNavigate();
    this.router.navigate(['/mcq-tests', test.id]);
  }
}
