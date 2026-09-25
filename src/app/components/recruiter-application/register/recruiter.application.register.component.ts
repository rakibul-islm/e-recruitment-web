import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '../../base.component';
import { RecruiterApplicationService } from '../../../services/recruiter-application/recruiter.application.service';
import { RecruiterApplicationRequest } from '../../../services/recruiter-application/domain/recruiter.application.domain';
import { OrganizationTypeService } from '../../../services/organization-type/organization.type.service';
import { OrganizationType } from '../../../services/organization-type/domain/organization.type.domain';

@Component({
  selector: 'app-recruiter-application-register',
  templateUrl: './recruiter.application.register.component.html',
  styleUrls: ['./recruiter.application.register.component.scss']
})
export class RecruiterApplicationRegisterComponent extends BaseComponent implements OnInit {
  submitted = false;
  registerForm!: FormGroup;

  organizationTypes: OrganizationType[] = [];
  newTypeDialogVisible = false;
  newTypeForm!: FormGroup;
  savingType = false;

  constructor(
    private formBuilder: FormBuilder,
    private recruiterApplicationService: RecruiterApplicationService,
    private organizationTypeService: OrganizationTypeService
  ) {
    super();
  }

  ngOnInit(): void {
    this.prepareForm();
    this.newTypeForm = this.formBuilder.group({ name: ['', Validators.required] });
    this.fetchOrganizationTypes();
  }

  prepareForm(): void {
    this.registerForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9+ -]{7,20}$')]],
      organizationName: ['', Validators.required],
      organizationWebsite: [''],
      organizationSector: [null, Validators.required],
      organizationSize: [''],
      organizationAddress: ['', Validators.required],
      organizationPhone: ['', [Validators.required, Validators.pattern('^[0-9+ -]{7,20}$')]],
      organizationEmail: ['', [Validators.required, Validators.email]],
      jobTitle: ['', Validators.required],
      message: ['']
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
        this.registerForm.patchValue({ organizationSector: name });
        this.fetchOrganizationTypes();
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
