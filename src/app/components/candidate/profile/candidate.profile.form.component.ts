import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { CandidateProfileService } from '../../../services/candidate-profile/candidate.profile.service';
import { CandidateProfile } from '../../../services/candidate-profile/domain/candidate.profile.domain';
import { AuthService } from '../../../services/utility/security/auth.service';
import { Profile } from '../../../services/user/domain/user.domain';

@Component({
  selector: 'app-candidate-profile-form',
  templateUrl: './candidate.profile.form.component.html',
  styleUrls: ['./candidate.profile.form.component.scss']
})
export class CandidateProfileFormComponent extends BaseComponent implements OnInit {
  profileForm!: FormGroup;
  generating = false;
  // Name/email/photo are account-level data (edited from /profile), shown read-only here so the
  // CV always reflects the same identity the rest of the app uses instead of a second copy.
  accountProfile: Profile = new Profile();

  constructor(
    private formBuilder: FormBuilder,
    private candidateProfileService: CandidateProfileService,
    private authService: AuthService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribers.accountProfileSub = this.authService.getProfileData().subscribe(profile => this.accountProfile = profile);
    this.fetchProfile();
  }

  fetchProfile(): void {
    this.subscribers.fetchProfileSub = this.candidateProfileService.fetchMyProfile().subscribe(response => {
      this.prepareForm(response?.obj);
    });
  }

  prepareForm(formData?: CandidateProfile): void {
    formData = formData || new CandidateProfile();

    this.profileForm = this.formBuilder.group({
      headline: [formData.headline],
      summary: [formData.summary],
      linkedinUrl: [formData.linkedinUrl],
      portfolioUrl: [formData.portfolioUrl],
      workExperience: this.formBuilder.array((formData.workExperience || []).map(item => this.buildWorkExperienceGroup(item))),
      education: this.formBuilder.array((formData.education || []).map(item => this.buildEducationGroup(item))),
      skills: this.formBuilder.array((formData.skills || []).map(item => this.buildSkillGroup(item))),
      certifications: this.formBuilder.array((formData.certifications || []).map(item => this.buildCertificationGroup(item))),
      languages: this.formBuilder.array((formData.languages || []).map(item => this.buildLanguageGroup(item))),
      projects: this.formBuilder.array((formData.projects || []).map(item => this.buildProjectGroup(item)))
    });
  }

  get workExperience(): FormArray { return this.profileForm.get('workExperience') as FormArray; }
  get education(): FormArray { return this.profileForm.get('education') as FormArray; }
  get skills(): FormArray { return this.profileForm.get('skills') as FormArray; }
  get certifications(): FormArray { return this.profileForm.get('certifications') as FormArray; }
  get languages(): FormArray { return this.profileForm.get('languages') as FormArray; }
  get projects(): FormArray { return this.profileForm.get('projects') as FormArray; }

  buildWorkExperienceGroup(item: any = {}): FormGroup {
    return this.formBuilder.group({
      title: [item.title],
      companyName: [item.companyName],
      location: [item.location],
      startDate: [item.startDate ? new Date(item.startDate) : null],
      endDate: [item.endDate ? new Date(item.endDate) : null],
      current: [item.current || false],
      description: [item.description]
    });
  }

  buildEducationGroup(item: any = {}): FormGroup {
    return this.formBuilder.group({
      institution: [item.institution],
      degree: [item.degree],
      fieldOfStudy: [item.fieldOfStudy],
      startDate: [item.startDate ? new Date(item.startDate) : null],
      endDate: [item.endDate ? new Date(item.endDate) : null],
      current: [item.current || false],
      grade: [item.grade]
    });
  }

  buildSkillGroup(item: any = {}): FormGroup {
    return this.formBuilder.group({ name: [item.name], level: [item.level] });
  }

  buildCertificationGroup(item: any = {}): FormGroup {
    return this.formBuilder.group({
      name: [item.name],
      issuer: [item.issuer],
      date: [item.date ? new Date(item.date) : null],
      credentialUrl: [item.credentialUrl]
    });
  }

  buildLanguageGroup(item: any = {}): FormGroup {
    return this.formBuilder.group({ name: [item.name], proficiency: [item.proficiency] });
  }

  buildProjectGroup(item: any = {}): FormGroup {
    return this.formBuilder.group({ name: [item.name], description: [item.description], url: [item.url] });
  }

  // New entries go to the top of each list so the one the candidate is currently filling in
  // stays visible without scrolling past everything already added.
  addWorkExperience(): void { this.workExperience.insert(0, this.buildWorkExperienceGroup()); }
  addEducation(): void { this.education.insert(0, this.buildEducationGroup()); }
  addSkill(): void { this.skills.insert(0, this.buildSkillGroup()); }
  addCertification(): void { this.certifications.insert(0, this.buildCertificationGroup()); }
  addLanguage(): void { this.languages.insert(0, this.buildLanguageGroup()); }
  addProject(): void { this.projects.insert(0, this.buildProjectGroup()); }

  // Marking an entry "current" pulls it to the top of its list, same as a freshly added entry -
  // the ongoing job/degree is the one most worth seeing first.
  moveToTopIfCurrent(array: FormArray, index: number, isCurrent: boolean): void {
    if (!isCurrent || index === 0) return;
    const group = array.at(index);
    array.removeAt(index);
    array.insert(0, group);
  }

  removeAt(array: FormArray, index: number): void { array.removeAt(index); }

  // Saving always regenerates the CV too, so there's one action instead of a separate "Generate CV"
  // step the candidate could forget to click after editing.
  saveProfile(): void {
    this.generating = true;
    this.subscribers.updateProfileSub = this.candidateProfileService.updateMyProfile(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.subscribers.generateCvSub = this.candidateProfileService.generateCv().subscribe({
          next: () => {
            this.generating = false;
            this.notificationService.sendSuccessMsg('candidateProfile.saveAndGenerateSuccess');
            this.router.navigate(['/my/profile']);
          },
          error: () => { this.generating = false; }
        });
      },
      error: () => { this.generating = false; }
    });
  }
}
