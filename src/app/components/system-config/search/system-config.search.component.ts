import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { SystemConfigService } from '../../../services/system-config/system-config.service';
import { SystemConfig } from '../../../services/system-config/domain/system-config.domain';

@Component({
  selector: 'app-system-config-search',
  templateUrl: './system-config.search.component.html'
})
export class SystemConfigSearchComponent extends BaseComponent implements OnInit {
  systemConfigs: SystemConfig[] = [];
  selectedSystemConfig: SystemConfig | null = null;

  filterForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private systemConfigService: SystemConfigService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.prepareForm();
    this.registerFilterForm('system-config-search-filters', this.filterForm);
  }

  prepareForm(): void {
    this.filterForm = this.formBuilder.group({
      configKey: ['']
    });
  }

  fetchSystemConfigs(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(this.filterForm, event);

    this.subscribers.searchSystemConfigsSub = this.systemConfigService.searchSystemConfigs(params).subscribe({
      next: (response) => {
        this.systemConfigs = response?.page?.content || [];
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
    this.fetchSystemConfigs({ first: 0, rows: this.rows });
  }

  clearFilters(): void {
    this.clearFilterForm(this.filterForm);
  }

  viewSystemConfig(systemConfig: SystemConfig): void {
    this.preserveFiltersOnNavigate();
    this.router.navigate(['/system-configs', systemConfig.id]);
  }
}
