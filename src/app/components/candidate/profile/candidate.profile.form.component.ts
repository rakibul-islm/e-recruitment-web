import { withHttpScheme } from '../../../utils/url.util';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { CandidateProfileService } from '../../../services/candidate-profile/candidate.profile.service';
import { CandidateProfile, ProfileCompleteness } from '../../../services/candidate-profile/domain/candidate.profile.domain';
import { AuthService } from '../../../services/utility/security/auth.service';
import { Profile } from '../../../services/user/domain/user.domain';
import { ProfileCompletenessComponent } from './completeness/profile.completeness.component';

@Component({
  selector: 'app-candidate-profile-form',
  templateUrl: './candidate.profile.form.component.html',
  styleUrls: ['./candidate.profile.form.component.scss']
})
export class CandidateProfileFormComponent extends BaseComponent implements OnInit {
  profileForm!: FormGroup;
  generating = false;
  suggestions: string[] = [];
  headlineValues = ['Software Engineer', 'Senior Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Mobile App Developer', 'Web Developer', 'Java Developer', 'Data Analyst', 'Data Scientist', 'DevOps Engineer', 'QA Engineer', 'UI/UX Designer', 'Graphic Designer', 'Project Manager', 'Business Analyst', 'System Analyst', 'Network Engineer', 'IT Support Officer', 'Accountant', 'Finance Officer', 'Banking Professional', 'Marketing Executive', 'Sales Executive', 'HR Executive', 'Customer Service Officer', 'Teacher', 'Civil Engineer', 'Electrical Engineer', 'Mechanical Engineer', 'Fresh Graduate', 'Student'];
  fieldOfStudyValues = ['Computer Science and Engineering', 'Information Technology', 'Software Engineering', 'Electrical and Electronic Engineering', 'Civil Engineering', 'Mechanical Engineering', 'Business Administration', 'Business Studies', 'Accounting', 'Finance', 'Marketing', 'Management', 'Economics', 'Banking and Insurance', 'Human Resource Management', 'English', 'Bangla', 'Law', 'Mathematics', 'Statistics', 'Physics', 'Chemistry', 'Biology', 'Pharmacy', 'Medicine', 'Sociology', 'Political Science', 'Public Administration', 'Psychology', 'Education', 'Architecture', 'Agriculture', 'Science', 'Commerce', 'Humanities'];
  languageOptions = ['Bangla', 'English', 'Hindi', 'Urdu', 'Arabic', 'French', 'German', 'Spanish', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Portuguese', 'Italian', 'Turkish', 'Malay'];
  levelValues = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  proficiencyValues = ['Basic', 'Conversational', 'Fluent', 'Native'];
  degreeValues = ['PSC', 'JSC', 'SSC', 'O-Level', 'HSC', 'A-Level', 'Dakhil', 'Alim', 'Diploma', 'Bachelor', 'Honors', 'BBA', 'BSc', 'BA', 'BSS', 'BCom', 'BSc in Engineering', 'MBBS', 'LLB', 'Master', 'MBA', 'MSc', 'MA', 'MSS', 'MCom', 'MPhil', 'PhD'];
  // Name/email/photo are account-level data (edited from /profile), shown read-only here so the
  // CV always reflects the same identity the rest of the app uses instead of a second copy.
  accountProfile: Profile = new Profile();

  constructor(
    private formBuilder: FormBuilder,
    private candidateProfileService: CandidateProfileService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  completeness?: ProfileCompleteness;

  ngOnInit(): void {
    this.subscribers.accountProfileSub = this.authService.getProfileData().subscribe(profile => this.accountProfile = profile);
    this.fetchProfile();
  }

  fetchProfile(): void {
    this.subscribers.fetchProfileSub = this.candidateProfileService.fetchMyProfile().subscribe(response => {
      this.completeness = response?.obj?.completeness;
      this.prepareForm(response?.obj);
      const section = this.route.snapshot.queryParamMap.get('section');
      if (section) {
        setTimeout(() => ProfileCompletenessComponent.scrollToSection(section), 100);
      }
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
      organizationName: [item.organizationName],
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

  suggest(event: { query: string }, source: string[]): void {
    const query = (event.query || '').trim().toLowerCase();
    this.suggestions = source.filter(option => option.toLowerCase().includes(query));
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
  private normalizedUrls(value: any): any {
    const withScheme = (items: any[], key: string) => (items || []).map(item => ({ ...item, [key]: withHttpScheme(item[key]) }));
    return {
      ...value,
      linkedinUrl: withHttpScheme(value.linkedinUrl),
      portfolioUrl: withHttpScheme(value.portfolioUrl),
      certifications: withScheme(value.certifications, 'credentialUrl'),
      projects: withScheme(value.projects, 'url')
    };
  }

  saveProfile(): void {
    this.generating = true;
    this.subscribers.updateProfileSub = this.candidateProfileService.updateMyProfile(this.normalizedUrls(this.profileForm.getRawValue())).subscribe({
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
