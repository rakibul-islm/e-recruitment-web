import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { ApplicationService } from '../../../services/application/application.service';
import { Application } from '../../../services/application/domain/application.domain';
import { triggerDownload } from '../../../services/utility/file-download.util';

@Component({
  selector: 'app-candidate-applications',
  templateUrl: './candidate.applications.component.html'
})
export class CandidateApplicationsComponent extends BaseComponent implements OnInit {
  applications: Application[] = [];

  constructor(private applicationService: ApplicationService, private router: Router) {
    super();
  }

  viewApplication(application: Application): void {
    this.router.navigate(['/my/applications', application.id]);
  }

  ngOnInit(): void {
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
      triggerDownload(blob, `CV-application-${application.id}.pdf`);
    });
  }
}
