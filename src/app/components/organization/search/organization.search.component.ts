import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { OrganizationService } from '../../../services/organization/organization.service';
import { Organization } from '../../../services/organization/domain/organization.domain';
import { AuthService } from '../../../services/utility/security/auth.service';

@Component({
  selector: 'app-organization-search',
  templateUrl: './organization.search.component.html'
})
export class OrganizationSearchComponent extends BaseComponent implements OnInit {
  organizations: Organization[] = [];
  selectedOrganization: Organization | null = null;
  // A recruiter scoped to one organization (backend enforces this regardless) can't create additional
  // organizations - hide the button rather than let them hit the confirm-then-error round trip.
  isOrganizationScoped = false;

  filterForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribers.profileSub = this.authService.getProfileData().subscribe(profile => {
      this.isOrganizationScoped = !!profile?.organizationId;
    });
    this.prepareForm();
    this.registerFilterForm('organization-search-filters', this.filterForm);
  }

  prepareForm(): void {
    this.filterForm = this.formBuilder.group({
      name_like: ['']
    });
  }

  fetchOrganizations(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(this.filterForm, event);

    this.subscribers.searchOrganizationsSub = this.organizationService.searchOrganizations(params).subscribe({
      next: (response) => {
        this.organizations = response?.page?.content || [];
        this.totalRecords = response?.page?.totalElements || 0;
        this.loading = false;
        // The Search tab (index 0) is hidden entirely for a scoped recruiter, so Results is index
        // 0 there instead of the usual 1 - jumping to a nonexistent index 1 left nothing open.
        this.activeTabIndex = this.isOrganizationScoped ? 0 : 1;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  search(table: Table): void {
    table.first = 0;
    this.fetchOrganizations({ first: 0, rows: this.rows });
  }

  clearFilters(): void {
    this.clearFilterForm(this.filterForm);
  }

  createOrganization(): void {
    this.clearFilters();
    this.router.navigate(['/organizations/create']);
  }

  viewOrganization(organization: Organization): void {
    this.preserveFiltersOnNavigate();
    this.router.navigate(['/organizations', organization.id]);
  }
}
