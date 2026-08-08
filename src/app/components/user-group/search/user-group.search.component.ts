import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { UserGroupService } from '../../../services/user-group/user-group.service';
import { UserGroup } from '../../../services/user-group/domain/user-group.domain';

@Component({
  selector: 'app-user-group-search',
  templateUrl: './user-group.search.component.html'
})
export class UserGroupSearchComponent extends BaseComponent implements OnInit {
  userGroups: UserGroup[] = [];
  selectedUserGroup: UserGroup | null = null;

  filterForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userGroupService: UserGroupService,
    private router: Router
  ) {
    super();
  }

  prepareForm(): void {
    this.filterForm = this.formBuilder.group({
      name: ['']
    });
  }

  ngOnInit(): void {
    this.prepareForm();
    this.registerFilterForm('user-group-search-filters', this.filterForm);
  }

  fetchUserGroups(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(this.filterForm, event);

    this.subscribers.searchUserGroupsSub = this.userGroupService.searchUserGroups(params).subscribe({
      next: (response) => {
        this.userGroups = response?.page?.content || [];
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
    this.fetchUserGroups({ first: 0, rows: this.rows });
  }

  clearFilters(): void {
    this.clearFilterForm(this.filterForm);
  }

  createUserGroup(): void {
    this.clearFilters();
    this.router.navigate(['/user-groups/create']);
  }

  viewUserGroup(userGroup: UserGroup): void {
    this.preserveFiltersOnNavigate();
    this.router.navigate(['/user-groups', userGroup.id]);
  }
}
