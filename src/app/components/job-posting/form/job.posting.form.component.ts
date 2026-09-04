import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { JobPostingService } from '../../../services/job-posting/job.posting.service';
import { CompanyService } from '../../../services/company/company.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { JobPosting, JobPostingRequest, JOB_STATUS_OPTIONS } from '../../../services/job-posting/domain/job.posting.domain';
import { Company } from '../../../services/company/domain/company.domain';
import { AuthService } from '../../../services/utility/security/auth.service';

@Component({
  selector: 'app-job-posting-form',
  templateUrl: './job.posting.form.component.html'
})
export class JobPostingFormComponent extends BaseComponent implements OnInit {
  jobPostingForm!: FormGroup;
  jobPostingId?: number;
  companyOptions: { label: string; value: number; website?: string; address?: string; phone?: string; email?: string }[] = [];
  statusOptions = JOB_STATUS_OPTIONS;
  aiSuggesting = false;
  // Set once from the logged-in user's own profile - a recruiter scoped to one company (backend
  // enforces this regardless) gets the company field pre-filled and locked instead of a real choice.
  scopedCompanyId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private jobPostingService: JobPostingService,
    private companyService: CompanyService,
    private authService: AuthService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribers.profileSub = this.authService.getProfileData().subscribe(profile => {
      this.scopedCompanyId = profile?.companyId ?? null;
      this.applyCompanyScope();
    });
    this.fetchCompanyOptions();

    this.subscribers.paramMapSub = this.route.paramMap.subscribe(paramMap => {
      this.jobPostingId = Number(paramMap.get('id')) || undefined;
      this.jobPostingId ? this.fetchJobPosting(this.jobPostingId) : this.prepareForm();
    });
  }

  fetchCompanyOptions(): void {
    this.subscribers.companyOptionsSub = this.companyService.searchCompanies(new Map().set('isPageable', false))
      .subscribe(response => {
        const companies: Company[] = response?.list || [];
        this.companyOptions = companies.map(c => ({ label: c.name, value: c.id, website: c.website, address: c.address, phone: c.phone, email: c.email }));
        this.applyCompanyScope();
      });
  }

  // Idempotent - safe to call again as profile/companyOptions/form each become available in any order.
  applyCompanyScope(): void {
    if (!this.scopedCompanyId || !this.jobPostingForm) { return; }

    const companyIdControl = this.jobPostingForm.get('companyId')!;
    if (!companyIdControl.value) { companyIdControl.setValue(this.scopedCompanyId); }

    const company = this.companyOptions.find(c => c.value === this.scopedCompanyId);
    if (company) {
      this.jobPostingForm.get('companyName')!.setValue(company.label, { emitEvent: false });
      this.jobPostingForm.get('companyWebsite')!.setValue(company.website || '', { emitEvent: false });
      this.jobPostingForm.get('companyAddress')!.setValue(company.address || '', { emitEvent: false });
      this.jobPostingForm.get('companyPhone')!.setValue(company.phone || '', { emitEvent: false });
      this.jobPostingForm.get('companyEmail')!.setValue(company.email || '', { emitEvent: false });
    }

    companyIdControl.disable();
    this.jobPostingForm.get('companyName')!.disable();
    // The backend re-derives these from the recruiter's own Company record regardless (see
    // JobCircularServiceImpl.applyOwnCompany), so leaving them editable here would just be confusing.
    this.jobPostingForm.get('companyWebsite')!.disable();
    this.jobPostingForm.get('companyAddress')!.disable();
    this.jobPostingForm.get('companyPhone')!.disable();
    this.jobPostingForm.get('companyEmail')!.disable();
  }

  prepareForm(formData?: JobPosting): void {
    formData = formData || new JobPosting();

    this.jobPostingForm = this.formBuilder.group({
      jobTitle: [formData.jobTitle, Validators.required],
      companyId: [formData.companyId],
      companyName: [formData.companyName, Validators.required],
      companyAddress: [formData.companyAddress],
      companyPhone: [formData.companyPhone, Validators.required],
      companyEmail: [formData.companyEmail, Validators.required],
      companyWebsite: [formData.companyWebsite],
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

    // Selecting a company fills in the contact fields it has on file.
    this.subscribers.companyChangeSub = this.jobPostingForm.get('companyId')!.valueChanges.subscribe(companyId => {
      const company = this.companyOptions.find(c => c.value === companyId);
      if (company) {
        this.jobPostingForm.get('companyName')!.setValue(company.label, { emitEvent: false });
        this.jobPostingForm.get('companyWebsite')!.setValue(company.website || '', { emitEvent: false });
        this.jobPostingForm.get('companyAddress')!.setValue(company.address || '', { emitEvent: false });
        this.jobPostingForm.get('companyPhone')!.setValue(company.phone || '', { emitEvent: false });
        this.jobPostingForm.get('companyEmail')!.setValue(company.email || '', { emitEvent: false });
      }
    });

    this.applyCompanyScope();
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
      companyName: this.jobPostingForm.get('companyName')!.value,
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
