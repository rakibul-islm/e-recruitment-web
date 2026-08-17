import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { PermissionService } from '../../../services/permission/permission.service';
import { Permission } from '../../../services/permission/domain/permission.domain';

@Component({
  selector: 'app-permission-search',
  templateUrl: './permission.search.component.html'
})
export class PermissionSearchComponent extends BaseComponent implements OnInit {
  permissions: Permission[] = [];
  selectedPermission: Permission | null = null;

  filterForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private permissionService: PermissionService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.prepareForm();
    this.registerFilterForm('permission-search-filters', this.filterForm);
  }

  prepareForm(): void {
    this.filterForm = this.formBuilder.group({
      name: [''],
      authority: [''],
      module: [''],
      routeName: ['']
    });
  }

  fetchPermissions(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(this.filterForm, event);

    this.subscribers.searchPermissionsSub = this.permissionService.searchPermissions(params).subscribe({
      next: (response) => {
        this.permissions = response?.page?.content || [];
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
    this.fetchPermissions({ first: 0, rows: this.rows });
  }

  clearFilters(): void {
    this.clearFilterForm(this.filterForm);
  }

  createPermission(): void {
    this.clearFilters();
    this.router.navigate(['/permissions/create']);
  }

  viewPermission(permission: Permission): void {
    this.preserveFiltersOnNavigate();
    this.router.navigate(['/permissions', permission.id]);
  }
}
