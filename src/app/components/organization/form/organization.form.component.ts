import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { OrganizationService } from '../../../services/organization/organization.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { Organization, OrganizationRequest } from '../../../services/organization/domain/organization.domain';
import { OrganizationTypeService } from '../../../services/organization-type/organization.type.service';
import { OrganizationType } from '../../../services/organization-type/domain/organization.type.domain';
import { organizationLogoUrl } from '../../../services/utility/logo.util';

@Component({
  selector: 'app-organization-form',
  templateUrl: './organization.form.component.html',
  styleUrls: ['./organization.form.component.scss']
})
export class OrganizationFormComponent extends BaseComponent implements OnInit {
  private static readonly LOGO_MAX_DIMENSION = 512;
  private static readonly LOGO_MAX_RAW_BYTES = 5 * 1024 * 1024;

  organizationForm!: FormGroup;
  organizationId?: number;

  organizationTypes: OrganizationType[] = [];
  newTypeDialogVisible = false;
  newTypeForm!: FormGroup;
  savingType = false;

  logoFileId?: number;
  logoPreview: string | null = null;
  logoRemoveRequested = false;
  private pendingLogo: string | null = null;

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
        this.organizationForm.patchValue({ organizationType: name });
        this.fetchOrganizationTypes();
      },
      error: () => { this.savingType = false; }
    });
  }

  prepareForm(formData?: Organization): void {
    formData = formData || new Organization();

    this.organizationForm = this.formBuilder.group({
      name: [formData.name, Validators.required],
      organizationType: [formData.organizationType],
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
      this.logoFileId = response?.obj?.logoFileId;
      this.prepareForm(response?.obj);
    });
  }

  get logoSrc(): string | null {
    if (this.logoPreview) { return this.logoPreview; }
    return !this.logoRemoveRequested ? organizationLogoUrl(this.logoFileId) : null;
  }

  // Resizes to fit a 512px box, aspect ratio preserved.
  async onLogoFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) { return; }
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      this.notificationService.sendErrorMsg('organization.logoInvalidType');
      return;
    }
    if (file.size > OrganizationFormComponent.LOGO_MAX_RAW_BYTES) {
      this.notificationService.sendErrorMsg('organization.logoTooLarge');
      return;
    }
    try {
      this.pendingLogo = await this.resizeLogo(file);
      this.logoPreview = this.pendingLogo;
      this.logoRemoveRequested = false;
    } catch {
      this.notificationService.sendErrorMsg('organization.logoInvalidType');
    }
  }

  removeLogo(): void {
    if (this.logoPreview || this.pendingLogo) {
      this.pendingLogo = null;
      this.logoPreview = null;
      return;
    }
    if (this.logoFileId) { this.logoRemoveRequested = true; }
  }

  private resizeLogo(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read failed'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('decode failed'));
        img.onload = () => {
          const scale = Math.min(1, OrganizationFormComponent.LOGO_MAX_DIMENSION / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(file.type === 'image/jpeg' ? canvas.toDataURL('image/jpeg', 0.9) : canvas.toDataURL('image/png'));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
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
    this.subscribers.createOrganizationSub = this.organizationService.createOrganization(payload).subscribe(response => {
      this.notificationService.sendSuccessMsg('organization.createSuccess');
      this.saveLogoChanges(response?.obj?.id ?? undefined);
    });
  }

  updateOrganization(payload: OrganizationRequest): void {
    this.subscribers.updateOrganizationSub = this.organizationService.updateOrganization(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('organization.updateSuccess');
      this.saveLogoChanges(this.organizationId);
    });
  }

  // Runs after the organization row exists, then navigation continues.
  private saveLogoChanges(organizationId: number | undefined): void {
    if (!organizationId || (!this.pendingLogo && !this.logoRemoveRequested)) {
      this.navigateToSearch();
      return;
    }
    const body = this.pendingLogo ? { imageBase64: this.pendingLogo } : {};
    this.subscribers.logoSub = this.organizationService.updateLogo(organizationId, body).subscribe({
      next: () => this.navigateToSearch(),
      error: () => {
        this.notificationService.sendErrorMsg('organization.logoUpdateFailed');
        this.navigateToSearch();
      }
    });
  }

  navigateToSearch(): void {
    this.router.navigate(['/organizations']);
  }
}
