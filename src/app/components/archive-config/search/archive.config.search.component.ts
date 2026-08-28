import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { ArchiveConfigService } from '../../../services/archive-config/archive.config.service';
import { ArchiveConfig } from '../../../services/archive-config/domain/archive.config.domain';

@Component({
  selector: 'app-archive-config-search',
  templateUrl: './archive.config.search.component.html'
})
export class ArchiveConfigSearchComponent extends BaseComponent implements OnInit {
  archiveConfigs: ArchiveConfig[] = [];
  selectedArchiveConfig: ArchiveConfig | null = null;

  filterForm!: FormGroup;

  // Mixes a translation key with plain table names - TranslateOptionsDirective resolves both correctly.
  sourceTableOptions: { label: string; value: string }[] = [
    { label: 'archiveConfig.sourceTableAll', value: '' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private archiveConfigService: ArchiveConfigService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.prepareForm();
    this.registerFilterForm('archive-config-search-filters', this.filterForm);
    this.fetchSourceTableOptions();
  }

  // Populated from the schema itself, uppercased since some dialects (e.g. Postgres) report table names in lowercase.
  fetchSourceTableOptions(): void {
    this.subscribers.listSourceTablesSub = this.archiveConfigService.listSourceTables()
    .subscribe(response => {
      const tables: string[] = response?.list || [];
      this.sourceTableOptions = [
        { label: 'archiveConfig.sourceTableAll', value: '' },
        ...tables.map(table => {
          const upper = table.toUpperCase();
          return { label: upper, value: upper };
        })
      ];
    });
  }

  prepareForm(): void {
    this.filterForm = this.formBuilder.group({
      sourceTable: ['']
    });
  }

  fetchArchiveConfigs(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(this.filterForm, event);

    this.subscribers.searchArchiveConfigsSub = this.archiveConfigService.searchArchiveConfigs(params).subscribe({
      next: (response) => {
        this.archiveConfigs = response?.page?.content || [];
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
    this.fetchArchiveConfigs({ first: 0, rows: this.rows });
  }

  clearFilters(): void {
    this.clearFilterForm(this.filterForm);
  }

  createArchiveConfig(): void {
    this.clearFilters();
    this.router.navigate(['/archive-configs/create']);
  }

  viewArchiveConfig(archiveConfig: ArchiveConfig): void {
    this.preserveFiltersOnNavigate();
    this.router.navigate(['/archive-configs', archiveConfig.id]);
  }
}
