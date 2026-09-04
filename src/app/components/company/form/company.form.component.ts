import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { CompanyService } from '../../../services/company/company.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { Company, CompanyRequest } from '../../../services/company/domain/company.domain';
import { CompanyTypeService } from '../../../services/company-type/company.type.service';
import { CompanyType } from '../../../services/company-type/domain/company.type.domain';

@Component({
  selector: 'app-company-form',
  templateUrl: './company.form.component.html'
})
export class CompanyFormComponent extends BaseComponent implements OnInit {
  companyForm!: FormGroup;
  companyId?: number;

  companyTypes: CompanyType[] = [];
  newTypeDialogVisible = false;
  newTypeForm!: FormGroup;
  savingType = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private companyTypeService: CompanyTypeService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.newTypeForm = this.formBuilder.group({ name: ['', Validators.required] });
    this.fetchCompanyTypes();

    this.subscribers.paramMapSub = this.route.paramMap.subscribe(paramMap => {
      this.companyId = Number(paramMap.get('id')) || undefined;
      this.companyId ? this.fetchCompany(this.companyId) : this.prepareForm();
    });
  }

  fetchCompanyTypes(): void {
    this.subscribers.companyTypesSub = this.companyTypeService.list().subscribe(response => {
      this.companyTypes = response?.list || [];
    });
  }

  openNewTypeDialog(): void {
    this.newTypeForm.reset();
    this.newTypeDialogVisible = true;
  }

  createCompanyType(): void {
    if (this.isFormInvalid(this.newTypeForm)) { return; }

    this.savingType = true;
    const name = this.newTypeForm.value.name;
    this.subscribers.createTypeSub = this.companyTypeService.create(name).subscribe({
      next: () => {
        this.savingType = false;
        this.newTypeDialogVisible = false;
        this.companyForm.patchValue({ industry: name });
        this.fetchCompanyTypes();
      },
      error: () => { this.savingType = false; }
    });
  }

  prepareForm(formData?: Company): void {
    formData = formData || new Company();

    this.companyForm = this.formBuilder.group({
      name: [formData.name, Validators.required],
      industry: [formData.industry],
      website: [formData.website],
      phone: [formData.phone],
      email: [formData.email],
      address: [formData.address],
      size: [formData.size],
      description: [formData.description]
    });
  }

  fetchCompany(id: number): void {
    this.subscribers.findCompanySub = this.companyService.findCompanyById(id).subscribe(response => {
      this.prepareForm(response?.obj);
    });
  }

  submit(): void {
    if (this.isFormInvalid(this.companyForm)) { return; }

    const payload: CompanyRequest = this.companyForm.getRawValue();

    this.commonConfirmDialogService.confirm(() => {
      this.companyId ? this.updateCompany({ ...payload, id: this.companyId }) : this.createCompany(payload);
    });
  }

  createCompany(payload: CompanyRequest): void {
    this.subscribers.createCompanySub = this.companyService.createCompany(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('company.createSuccess');
      this.navigateToSearch();
    });
  }

  updateCompany(payload: CompanyRequest): void {
    this.subscribers.updateCompanySub = this.companyService.updateCompany(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('company.updateSuccess');
      this.navigateToSearch();
    });
  }

  navigateToSearch(): void {
    this.router.navigate(['/companies']);
  }
}
