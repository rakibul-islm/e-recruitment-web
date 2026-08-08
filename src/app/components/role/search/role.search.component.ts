import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { RoleService } from '../../../services/role/role.service';
import { Role } from '../../../services/role/domain/role.domain';

@Component({
  selector: 'app-role-search',
  templateUrl: './role.search.component.html'
})
export class RoleSearchComponent extends BaseComponent implements OnInit {
  roles: Role[] = [];
  selectedRole: Role | null = null;

  filterForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private roleService: RoleService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.prepareForm();
    this.registerFilterForm('role-search-filters', this.filterForm);
  }

  prepareForm(): void {
    this.filterForm = this.formBuilder.group({
      name: [''],
      code: ['']
    });
  }

  fetchRoles(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(this.filterForm, event);

    this.subscribers.searchRolesSub = this.roleService.searchRoles(params).subscribe({
      next: (response) => {
        this.roles = response?.page?.content || [];
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
    this.fetchRoles({ first: 0, rows: this.rows });
  }

  clearFilters(): void {
    this.clearFilterForm(this.filterForm);
  }

  createRole(): void {
    this.clearFilters();
    this.router.navigate(['/roles/create']);
  }

  viewRole(role: Role): void {
    this.preserveFiltersOnNavigate();
    this.router.navigate(['/roles', role.id]);
  }
}
