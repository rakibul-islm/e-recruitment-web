import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { CompanyService } from '../../../services/company/company.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { Company } from '../../../services/company/domain/company.domain';
import { AuthService } from '../../../services/utility/security/auth.service';

@Component({
  selector: 'app-company-view',
  templateUrl: './company.view.component.html'
})
export class CompanyViewComponent extends BaseComponent implements OnInit {
  company: Company = new Company();
  companyId!: number;
  // A recruiter scoped to one company (backend enforces this regardless) can't delete it.
  isCompanyScoped = false;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private companyService: CompanyService,
    private authService: AuthService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.companyId = Number(this.route.snapshot.paramMap.get('id'));
    this.subscribers.profileSub = this.authService.getProfileData().subscribe(profile => {
      this.isCompanyScoped = !!profile?.companyId;
    });
    this.fetchCompany();
  }

  fetchCompany(): void {
    this.subscribers.findCompanySub = this.companyService.findCompanyById(this.companyId).subscribe(response => {
      this.company = response?.obj;
    });
  }

  deleteCompany(): void {
    this.commonConfirmDialogService.confirm(
      () => {
        this.subscribers.deleteCompanySub = this.companyService.deleteCompany(this.companyId).subscribe(() => {
          this.notificationService.sendSuccessMsg('company.deleteSuccess');
          this.navigateToSearch();
        });
      },
      null,
      'company.deleteConfirm', { name: this.company.name }
    );
  }

  navigateToSearch(): void {
    this.router.navigate(['/companies']);
  }
}
