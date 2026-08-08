import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../../base.component';
import { UserService } from '../../../../services/user/user.service';
import { UserAccount } from '../../../../services/user/domain/user.domain';

@Component({
  selector: 'app-user-search',
  templateUrl: './user.search.component.html'
})
export class UserSearchComponent extends BaseComponent implements OnInit {
  users: UserAccount[] = [];
  selectedUser: UserAccount | null = null;

  filterForm!: FormGroup;

  activeOptions = [
    { label: 'All', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  lockedOptions = [
    { label: 'All', value: null },
    { label: 'Locked', value: true },
    { label: 'Unlocked', value: false }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    super();
  }

  prepareForm(): void {
    this.filterForm = this.formBuilder.group({
      fullName: [''],
      email: [''],
      mobile: [''],
      active: [null],
      locked: [null],
      expiryDate_lte: [null]
    });
  }

  ngOnInit(): void {
    this.prepareForm();
    this.registerFilterForm('user-search-filters', this.filterForm);
  }

  fetchUsers(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(this.filterForm, event);

    this.subscribers.searchUsersSub = this.userService.searchUsers(params).subscribe({
      next: (response) => {
        this.users = response?.page?.content || [];
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
    this.fetchUsers({ first: 0, rows: this.rows });
  }

  clearFilters(): void {
    this.clearFilterForm(this.filterForm);
  }

  createUser(): void {
    this.clearFilters();
    this.router.navigate(['/users/create']);
  }

  viewUser(user: UserAccount): void {
    this.preserveFiltersOnNavigate();
    this.router.navigate(['/users', user.id]);
  }
}
