import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { JobPostingService } from '../../../services/job-posting/job.posting.service';
import { OrganizationService } from '../../../services/organization/organization.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { JobPosting, JobPostingRequest, JOB_STATUS_OPTIONS } from '../../../services/job-posting/domain/job.posting.domain';
import { Organization } from '../../../services/organization/domain/organization.domain';
import { AuthService } from '../../../services/utility/security/auth.service';

@Component({
  selector: 'app-job-posting-form',
  templateUrl: './job.posting.form.component.html'
})
export class JobPostingFormComponent extends BaseComponent implements OnInit {
  jobPostingForm!: FormGroup;
  jobPostingId?: number;
  organizationOptions: { label: string; value: number; website?: string; address?: string; phone?: string; email?: string }[] = [];
  statusOptions = JOB_STATUS_OPTIONS;
  aiSuggesting = false;
  // Set once from the logged-in user's own profile - a recruiter scoped to one organization (backend
  // enforces this regardless) gets the organization field pre-filled and locked instead of a real choice.
  scopedOrganizationId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private jobPostingService: JobPostingService,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribers.profileSub = this.authService.getProfileData().subscribe(profile => {
      this.scopedOrganizationId = profile?.organizationId ?? null;
      this.applyOrganizationScope();
    });
    this.fetchOrganizationOptions();

    this.subscribers.paramMapSub = this.route.paramMap.subscribe(paramMap => {
      this.jobPostingId = Number(paramMap.get('id')) || undefined;
      this.jobPostingId ? this.fetchJobPosting(this.jobPostingId) : this.prepareForm();
    });
  }

  fetchOrganizationOptions(): void {
    this.subscribers.organizationOptionsSub = this.organizationService.searchOrganizations(new Map().set('isPageable', false))
      .subscribe(response => {
        const organizations: Organization[] = response?.list || [];
        this.organizationOptions = organizations.map(c => ({ label: c.name, value: c.id, website: c.website, address: c.address, phone: c.phone, email: c.email }));
        this.applyOrganizationScope();
      });
  }

  // Idempotent - safe to call again as profile/organizationOptions/form each become available in any order.
  applyOrganizationScope(): void {
    if (!this.scopedOrganizationId || !this.jobPostingForm) { return; }

    const organizationIdControl = this.jobPostingForm.get('organizationId')!;
    if (!organizationIdControl.value) { organizationIdControl.setValue(this.scopedOrganizationId); }

    const organization = this.organizationOptions.find(c => c.value === this.scopedOrganizationId);
    if (organization) {
      this.jobPostingForm.get('organizationName')!.setValue(organization.label, { emitEvent: false });
      this.jobPostingForm.get('organizationWebsite')!.setValue(organization.website || '', { emitEvent: false });
      this.jobPostingForm.get('organizationAddress')!.setValue(organization.address || '', { emitEvent: false });
      this.jobPostingForm.get('organizationPhone')!.setValue(organization.phone || '', { emitEvent: false });
      this.jobPostingForm.get('organizationEmail')!.setValue(organization.email || '', { emitEvent: false });
    }

    organizationIdControl.disable();
    this.jobPostingForm.get('organizationName')!.disable();
    // The backend re-derives these from the recruiter's own Organization record regardless (see
    // JobCircularServiceImpl.applyOwnOrganization), so leaving them editable here would just be confusing.
    this.jobPostingForm.get('organizationWebsite')!.disable();
    this.jobPostingForm.get('organizationAddress')!.disable();
    this.jobPostingForm.get('organizationPhone')!.disable();
    this.jobPostingForm.get('organizationEmail')!.disable();
  }

  prepareForm(formData?: JobPosting): void {
    formData = formData || new JobPosting();

    this.jobPostingForm = this.formBuilder.group({
      jobTitle: [formData.jobTitle, Validators.required],
      organizationId: [formData.organizationId],
      organizationName: [formData.organizationName, Validators.required],
      organizationAddress: [formData.organizationAddress],
      organizationPhone: [formData.organizationPhone, Validators.required],
      organizationEmail: [formData.organizationEmail, Validators.required],
      organizationWebsite: [formData.organizationWebsite],
      applicationDeadLine: [formData.applicationDeadLine ? new Date(formData.applicationDeadLine) : null, Validators.required],
      vacancy: [formData.vacancy, [Validators.required, Validators.min(1)]],
      experience: [formData.experience],
      salary: [formData.salary],
      salaryMin: [formData.salaryMin],
      salaryMax: [formData.salaryMax],
      jobLocation: [formData.jobLocation],
      jobRequirement: [formData.jobRequirement, Validators.required],
      jobResponsibilities: [formData.jobResponsibilities],
      otherBenefits: [formData.otherBenefits],
      workPlace: [formData.workPlace],
      employmentStatus: [formData.employmentStatus],
      skills: [formData.skills],
      category: [formData.category],
      status: [formData.status || 'DRAFT', Validators.required]
    });

    // Selecting an organization fills in the contact fields it has on file.
    this.subscribers.organizationChangeSub = this.jobPostingForm.get('organizationId')!.valueChanges.subscribe(organizationId => {
      const organization = this.organizationOptions.find(c => c.value === organizationId);
      if (organization) {
        this.jobPostingForm.get('organizationName')!.setValue(organization.label, { emitEvent: false });
        this.jobPostingForm.get('organizationWebsite')!.setValue(organization.website || '', { emitEvent: false });
        this.jobPostingForm.get('organizationAddress')!.setValue(organization.address || '', { emitEvent: false });
        this.jobPostingForm.get('organizationPhone')!.setValue(organization.phone || '', { emitEvent: false });
        this.jobPostingForm.get('organizationEmail')!.setValue(organization.email || '', { emitEvent: false });
      }
    });

    this.applyOrganizationScope();
  }

  fetchJobPosting(id: number): void {
    this.subscribers.findJobPostingSub = this.jobPostingService.findJobPostingById(id).subscribe(response => {
      this.prepareForm(response?.obj);
    });
  }

  submit(): void {
    if (this.isFormInvalid(this.jobPostingForm)) { return; }

    const payload: JobPostingRequest = this.jobPostingForm.getRawValue();

    this.commonConfirmDialogService.confirm(() => {
      this.jobPostingId ? this.updateJobPosting({ ...payload, id: this.jobPostingId }) : this.createJobPosting(payload);
    });
  }

  createJobPosting(payload: JobPostingRequest): void {
    this.subscribers.createJobPostingSub = this.jobPostingService.createJobPosting(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('jobPosting.createSuccess');
      this.navigateToSearch();
    });
  }

  updateJobPosting(payload: JobPostingRequest): void {
    this.subscribers.updateJobPostingSub = this.jobPostingService.updateJobPosting(payload).subscribe(() => {
      this.notificationService.sendSuccessMsg('jobPosting.updateSuccess');
      this.navigateToSearch();
    });
  }

  navigateToSearch(): void {
    this.router.navigate(['/job-postings']);
  }

  autoFillWithAi(): void {
    const jobTitle = this.jobPostingForm.get('jobTitle')!.value;
    if (!jobTitle) {
      this.jobPostingForm.get('jobTitle')!.markAsTouched();
      return;
    }

    const context = {
      jobTitle,
      organizationName: this.jobPostingForm.get('organizationName')!.value,
      jobLocation: this.jobPostingForm.get('jobLocation')!.value,
      employmentStatus: this.jobPostingForm.get('employmentStatus')!.value,
      experience: this.jobPostingForm.get('experience')!.value,
      category: this.jobPostingForm.get('category')!.value,
      skills: this.jobPostingForm.get('skills')!.value
    };

    this.aiSuggesting = true;
    this.subscribers.aiSuggestSub = this.jobPostingService.aiSuggest(context).subscribe({
      next: response => {
        this.aiSuggesting = false;
        const suggestion = response?.obj;
        if (!suggestion) { return; }

        this.jobPostingForm.patchValue({
          jobRequirement: suggestion.jobRequirement,
          jobResponsibilities: suggestion.jobResponsibilities,
          otherBenefits: suggestion.otherBenefits,
          skills: suggestion.skills,
          category: suggestion.category,
          experience: suggestion.experience,
          employmentStatus: suggestion.employmentStatus
        });
        this.notificationService.sendSuccessMsg('jobPosting.aiAutoFillSuccess');
      },
      error: () => { this.aiSuggesting = false; }
    });
  }
}
