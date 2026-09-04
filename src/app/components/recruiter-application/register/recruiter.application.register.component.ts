import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '../../base.component';
import { RecruiterApplicationService } from '../../../services/recruiter-application/recruiter.application.service';
import { RecruiterApplicationRequest } from '../../../services/recruiter-application/domain/recruiter.application.domain';
import { CompanyTypeService } from '../../../services/company-type/company.type.service';
import { CompanyType } from '../../../services/company-type/domain/company.type.domain';

@Component({
  selector: 'app-recruiter-application-register',
  templateUrl: './recruiter.application.register.component.html',
  styleUrls: ['./recruiter.application.register.component.scss']
})
export class RecruiterApplicationRegisterComponent extends BaseComponent implements OnInit {
  submitted = false;
  registerForm!: FormGroup;

  companyTypes: CompanyType[] = [];
  newTypeDialogVisible = false;
  newTypeForm!: FormGroup;
  savingType = false;

  constructor(
    private formBuilder: FormBuilder,
    private recruiterApplicationService: RecruiterApplicationService,
    private companyTypeService: CompanyTypeService
  ) {
    super();
  }

  ngOnInit(): void {
    this.prepareForm();
    this.newTypeForm = this.formBuilder.group({ name: ['', Validators.required] });
    this.fetchCompanyTypes();
  }

  prepareForm(): void {
    this.registerForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9+ -]{7,20}$')]],
      companyName: ['', Validators.required],
      companyWebsite: [''],
      companyIndustry: [''],
      companySize: [''],
      companyAddress: [''],
      companyPhone: [''],
      companyEmail: ['', Validators.email],
      jobTitle: [''],
      message: ['']
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
        this.registerForm.patchValue({ companyIndustry: name });
        this.fetchCompanyTypes();
      },
      error: () => { this.savingType = false; }
    });
  }

  submit(): void {
    if (this.isFormInvalid(this.registerForm)) { return; }

    const request: RecruiterApplicationRequest = this.registerForm.getRawValue();
    this.subscribers.submitSub = this.recruiterApplicationService.submit(request).subscribe(() => {
      this.submitted = true;
    });
  }
}
