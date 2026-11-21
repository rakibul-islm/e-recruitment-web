import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TableLazyLoadEvent } from 'primeng/table';
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
  }

  fetchApplications(event: TableLazyLoadEvent): void {
    this.loading = true;
    const params = this.buildSearchParams(new FormGroup({}), event);
    this.subscribers.myApplicationsSub = this.applicationService.searchMyApplications(params).subscribe({
      next: (response) => {
        this.applications = response?.page?.content || [];
        this.totalRecords = response?.page?.totalElements || 0;
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
