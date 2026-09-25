import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { OrganizationService } from '../../../services/organization/organization.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { Organization } from '../../../services/organization/domain/organization.domain';
import { AuthService } from '../../../services/utility/security/auth.service';

@Component({
  selector: 'app-organization-view',
  templateUrl: './organization.view.component.html'
})
export class OrganizationViewComponent extends BaseComponent implements OnInit {
  organization: Organization = new Organization();
  organizationId!: number;
  // A recruiter scoped to one organization (backend enforces this regardless) can't delete it.
  isOrganizationScoped = false;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.organizationId = Number(this.route.snapshot.paramMap.get('id'));
    this.subscribers.profileSub = this.authService.getProfileData().subscribe(profile => {
      this.isOrganizationScoped = !!profile?.organizationId;
    });
    this.fetchOrganization();
  }

  fetchOrganization(): void {
    this.subscribers.findOrganizationSub = this.organizationService.findOrganizationById(this.organizationId).subscribe(response => {
      this.organization = response?.obj;
    });
  }

  deleteOrganization(): void {
    this.commonConfirmDialogService.confirm(
      () => {
        this.subscribers.deleteOrganizationSub = this.organizationService.deleteOrganization(this.organizationId).subscribe(() => {
          this.notificationService.sendSuccessMsg('organization.deleteSuccess');
          this.navigateToSearch();
        });
      },
      null,
      'organization.deleteConfirm', { name: this.organization.name }
    );
  }

  navigateToSearch(): void {
    this.router.navigate(['/organizations']);
  }
}
