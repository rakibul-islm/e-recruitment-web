import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { OrganizationService } from '../../../services/organization/organization.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { Organization, OrganizationRequest } from '../../../services/organization/domain/organization.domain';
import { OrganizationTypeService } from '../../../services/organization-type/organization.type.service';
import { OrganizationType } from '../../../services/organization-type/domain/organization.type.domain';

@Component({
  selector: 'app-organization-form',
  templateUrl: './organization.form.component.html'
})
export class OrganizationFormComponent extends BaseComponent implements OnInit {
  organizationForm!: FormGroup;
  organizationId?: number;

  organizationTypes: OrganizationType[] = [];
  newTypeDialogVisible = false;
  newTypeForm!: FormGroup;
  savingType = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private organizationService: OrganizationService,
    private organizationTypeService: OrganizationTypeService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.newTypeForm = this.formBuilder.group({ name: ['', Validators.required] });
    this.fetchOrganizationTypes();

    this.subscribers.paramMapSub = this.route.paramMap.subscribe(paramMap => {
      this.organizationId = Number(paramMap.get('id')) || undefined;
      this.organizationId ? this.fetchOrganization(this.organizationId) : this.prepareForm();
    });
  }

  fetchOrganizationTypes(): void {
    this.subscribers.organizationTypesSub = this.organizationTypeService.list().subscribe(response => {
      this.organizationTypes = response?.list || [];
    });
  }

  openNewTypeDialog(): void {
    this.newTypeForm.reset();
    this.newTypeDialogVisible = true;
  }

  createOrganizationType(): void {
    if (this.isFormInvalid(this.newTypeForm)) { return; }

    this.savingType = true;
    const name = this.newTypeForm.value.name;
    this.subscribers.createTypeSub = this.organizationTypeService.create(name).subscribe({
      next: () => {
        this.savingType = false;
        this.newTypeDialogVisible = false;
        this.organizationForm.patchValue({ sector: name });
        this.fetchOrganizationTypes();
      },
      error: () => { this.savingType = false; }
    });
  }

  prepareForm(formData?: Organization): void {
    formData = formData || new Organization();

    this.organizationForm = this.formBuilder.group({
      name: [formData.name, Validators.required],
      sector: [formData.sector],
      website: [formData.website],
      phone: [formData.phone],
      email: [formData.email],
      address: [formData.address],
      size: [formData.size],
      description: [formData.description]
    });
  }

  fetchOrganization(id: number): void {
    this.subscribers.findOrganizationSub = this.organizationService.findOrganizationById(id).subscribe(response => {
      this.prepareForm(response?.obj);
    });
  }

  submit(): void {
    if (this.isFormInvalid(this.organizationForm)) { return; }

    const payload: OrganizationRequest = this.organizationForm.getRawValue();

    this.commonConfirmDialogService.confirm(() => {
      this.organizationId ? this.updateOrganization({ ...payload, id: this.organizationId }) : this.createOrganization(payload);
    });
  }

  createOrganization(payload: OrganizationRequest): void {
    this.subscribers.createOrganizationSub = this.organizationService.createOrganization(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('organization.createSuccess');
      this.navigateToSearch();
    });
  }

  updateOrganization(payload: OrganizationRequest): void {
    this.subscribers.updateOrganizationSub = this.organizationService.updateOrganization(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('organization.updateSuccess');
      this.navigateToSearch();
    });
  }

  navigateToSearch(): void {
    this.router.navigate(['/organizations']);
  }
}
