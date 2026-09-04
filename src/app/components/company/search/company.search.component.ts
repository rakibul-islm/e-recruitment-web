import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../../base.component';
import { CompanyService } from '../../../services/company/company.service';
import { Company } from '../../../services/company/domain/company.domain';
import { AuthService } from '../../../services/utility/security/auth.service';

@Component({
  selector: 'app-company-search',
  templateUrl: './company.search.component.html'
})
export class CompanySearchComponent extends BaseComponent implements OnInit {
  companies: Company[] = [];
  selectedCompany: Company | null = null;
  // A recruiter scoped to one company (backend enforces this regardless) can't create additional
  // companies - hide the button rather than let them hit the confirm-then-error round trip.
  isCompanyScoped = false;

  filterForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private companyService: CompanyService,
    private authService: AuthService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribers.profileSub = this.authService.getProfileData().subscribe(profile => {
      this.isCompanyScoped = !!profile?.companyId;
    });
    this.prepareForm();
    this.registerFilterForm('company-search-filters', this.filterForm);
  }

  prepareForm(): void {
    this.filterForm = this.formBuilder.group({
      name_like: ['']
    });
  }

  fetchCompanies(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(this.filterForm, event);

    this.subscribers.searchCompaniesSub = this.companyService.searchCompanies(params).subscribe({
      next: (response) => {
        this.companies = response?.page?.content || [];
        this.totalRecords = response?.page?.totalElements || 0;
        this.loading = false;
        // The Search tab (index 0) is hidden entirely for a scoped recruiter, so Results is index
        // 0 there instead of the usual 1 - jumping to a nonexistent index 1 left nothing open.
        this.activeTabIndex = this.isCompanyScoped ? 0 : 1;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  search(table: Table): void {
    table.first = 0;
    this.fetchCompanies({ first: 0, rows: this.rows });
  }

  clearFilters(): void {
    this.clearFilterForm(this.filterForm);
  }

  createCompany(): void {
    this.clearFilters();
    this.router.navigate(['/companies/create']);
  }

  viewCompany(company: Company): void {
    this.preserveFiltersOnNavigate();
    this.router.navigate(['/companies', company.id]);
  }
}
