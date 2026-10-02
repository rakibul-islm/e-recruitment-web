import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { ApplicationService } from '../../../services/application/application.service';
import { Application } from '../../../services/application/domain/application.domain';
import { triggerDownload, pdfFileName } from '../../../services/utility/file-download.util';
import { AuthService } from '../../../services/utility/security/auth.service';
import { Profile } from '../../../services/user/domain/user.domain';

@Component({
  selector: 'app-candidate-applications',
  templateUrl: './candidate.applications.component.html'
})
export class CandidateApplicationsComponent extends BaseComponent implements OnInit {
  applications: Application[] = [];
  accountProfile: Profile = new Profile();

  constructor(private applicationService: ApplicationService, private router: Router, private authService: AuthService) {
    super();
  }

  viewApplication(application: Application): void {
    this.router.navigate(['/my/applications', application.id]);
  }

  ngOnInit(): void {
    this.subscribers.accountProfileSub = this.authService.getProfileData().subscribe(profile => this.accountProfile = profile);
    this.fetchApplications();
  }

  fetchApplications(): void {
    this.loading = true;
    this.subscribers.myApplicationsSub = this.applicationService.fetchMyApplications().subscribe({
      next: (response) => {
        this.applications = response?.list || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  downloadCv(application: Application): void {
    this.subscribers.downloadCvSub = this.applicationService.downloadCv(application.id).subscribe(blob => {
      triggerDownload(blob, pdfFileName('CV', this.accountProfile.fullName));
    });
  }
}
