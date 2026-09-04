import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../base.component';
import { CandidateProfileService } from '../../../../services/candidate-profile/candidate.profile.service';
import { CandidateProfile, GeneratedCv } from '../../../../services/candidate-profile/domain/candidate.profile.domain';
import { AuthService } from '../../../../services/utility/security/auth.service';
import { Profile } from '../../../../services/user/domain/user.domain';
import { triggerDownload, openBlobInNewTab } from '../../../../services/utility/file-download.util';

@Component({
  selector: 'app-candidate-profile-view',
  templateUrl: './candidate.profile.view.component.html',
  styleUrls: ['./candidate.profile.view.component.scss']
})
export class CandidateProfileViewComponent extends BaseComponent implements OnInit {
  profile: CandidateProfile = new CandidateProfile();
  accountProfile: Profile = new Profile();
  myCvs: GeneratedCv[] = [];

  constructor(
    private router: Router,
    private candidateProfileService: CandidateProfileService,
    private authService: AuthService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribers.accountProfileSub = this.authService.getProfileData().subscribe(profile => this.accountProfile = profile);
    this.fetchProfile();
    this.fetchMyCvs();
  }

  fetchProfile(): void {
    this.loading = true;
    this.subscribers.fetchProfileSub = this.candidateProfileService.fetchMyProfile().subscribe({
      next: (response) => {
        this.profile = response?.obj || new CandidateProfile();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  fetchMyCvs(): void {
    this.subscribers.myCvsSub = this.candidateProfileService.listMyCvs().subscribe(response => {
      this.myCvs = response?.list || [];
    });
  }

  // Backend keeps at most one live generation (see CandidateProfileServiceImpl.generateCv()).
  get latestCv(): GeneratedCv | undefined {
    return this.myCvs[0];
  }

  editProfile(): void {
    this.router.navigate(['/my/profile/edit']);
  }

  viewCv(cv: GeneratedCv): void {
    this.subscribers.viewCvSub = this.candidateProfileService.downloadCv(cv.id).subscribe(blob => {
      openBlobInNewTab(blob);
    });
  }

  downloadCv(cv: GeneratedCv): void {
    this.subscribers.downloadCvSub = this.candidateProfileService.downloadCv(cv.id).subscribe(blob => {
      triggerDownload(blob, `CV-${cv.id}.pdf`);
    });
  }
}
