import { displayUrl, withHttpScheme } from '../../../../utils/url.util';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../base.component';
import { CandidateCvService } from '../../../../services/candidate-cv/candidate.cv.service';
import { CandidateCv, GeneratedCv } from '../../../../services/candidate-cv/domain/candidate.cv.domain';
import { AuthService } from '../../../../services/utility/security/auth.service';
import { Profile } from '../../../../services/user/domain/user.domain';
import { triggerDownload, openBlobInNewTab, pdfFileName } from '../../../../services/utility/file-download.util';

@Component({
  selector: 'app-candidate-cv-view',
  templateUrl: './candidate.cv.view.component.html',
  styleUrls: ['./candidate.cv.view.component.scss']
})
export class CandidateCvViewComponent extends BaseComponent implements OnInit {
  profile: CandidateCv = new CandidateCv();
  accountProfile: Profile = new Profile();
  myCvs: GeneratedCv[] = [];

  toUrl(url?: string | null): string {
    return withHttpScheme(url);
  }

  shortUrl(url?: string | null): string {
    return displayUrl(url);
  }

  constructor(
    private router: Router,
    private candidateCvService: CandidateCvService,
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
    this.subscribers.fetchProfileSub = this.candidateCvService.fetchMyProfile().subscribe({
      next: (response) => {
        this.profile = response?.obj || new CandidateCv();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  fetchMyCvs(): void {
    this.subscribers.myCvsSub = this.candidateCvService.listMyCvs().subscribe(response => {
      this.myCvs = response?.list || [];
    });
  }

  // Backend keeps at most one live generation (see CandidateProfileServiceImpl.generateCv()).
  get latestCv(): GeneratedCv | undefined {
    return this.myCvs[0];
  }

  editProfile(): void {
    this.router.navigate(['/my/cv/edit']);
  }

  viewCv(cv: GeneratedCv): void {
    this.subscribers.viewCvSub = this.candidateCvService.downloadCv(cv.id).subscribe(blob => {
      openBlobInNewTab(blob, pdfFileName('CV', this.accountProfile.fullName));
    });
  }

  downloadCv(cv: GeneratedCv): void {
    this.subscribers.downloadCvSub = this.candidateCvService.downloadCv(cv.id).subscribe(blob => {
      triggerDownload(blob, pdfFileName('CV', this.accountProfile.fullName));
    });
  }
}
