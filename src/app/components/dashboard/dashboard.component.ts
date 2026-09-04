import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../base.component';
import { AuthService } from '../../services/utility/security/auth.service';
import { PermissionService } from '../../services/permission/permission.service';
import { Profile } from '../../services/user/domain/user.domain';
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { RecruitmentSummary } from '../../services/analytics/domain/analytics.domain';
import { ApplicationService } from '../../services/application/application.service';
import { Application } from '../../services/application/domain/application.domain';
import { OfferService } from '../../services/offer/offer.service';
import { SavedJobService } from '../../services/saved-job/saved.job.service';
import { JobAlertService } from '../../services/job-alert/job.alert.service';

const CANDIDATE_ACTIVE_STATUSES = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER'];
const RECENT_APPLICATIONS_LIMIT = 5;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends BaseComponent implements OnInit {
  profile: Profile = new Profile();
  isStaff = false;
  roleResolved = false;

  // Staff/recruiter view
  summary: RecruitmentSummary = new RecruitmentSummary();
  statusEntries: { status: string; count: number }[] = [];

  // Candidate view
  applications: Application[] = [];
  recentApplications: Application[] = [];
  activeApplicationsCount = 0;
  offersToRespondCount = 0;
  savedJobsCount = 0;
  jobAlertsCount = 0;

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private analyticsService: AnalyticsService,
    private applicationService: ApplicationService,
    private offerService: OfferService,
    private savedJobService: SavedJobService,
    private jobAlertService: JobAlertService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribers.profileSub = this.authService.getProfileData().subscribe(profile => this.profile = profile);

    this.subscribers.permissionsSub = this.permissionService.ensureGrantedRouteNamesLoaded().subscribe(() => {
      this.isStaff = this.permissionService.hasRoutePermission('analytics-list');
      this.roleResolved = true;
      this.isStaff ? this.fetchStaffData() : this.fetchCandidateData();
    });
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }

  private fetchStaffData(): void {
    this.loading = true;
    this.subscribers.summarySub = this.analyticsService.summary().subscribe({
      next: (response) => {
        this.summary = response?.obj || new RecruitmentSummary();
        this.statusEntries = Object.entries(this.summary.applicationsByStatus || {})
          .map(([status, count]) => ({ status, count: count as number }))
          .sort((a, b) => b.count - a.count);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private fetchCandidateData(): void {
    this.loading = true;
    this.subscribers.myApplicationsSub = this.applicationService.fetchMyApplications().subscribe({
      next: (response) => {
        this.applications = response?.list || [];
        this.recentApplications = [...this.applications]
          .sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime())
          .slice(0, RECENT_APPLICATIONS_LIMIT);
        this.activeApplicationsCount = this.applications.filter(a => CANDIDATE_ACTIVE_STATUSES.includes(a.status)).length;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.subscribers.myOffersSub = this.offerService.myOffers().subscribe(response => {
      const offers = response?.list || [];
      this.offersToRespondCount = offers.filter((offer: any) => offer.status === 'SENT').length;
    });

    this.subscribers.mySavedJobsSub = this.savedJobService.myList().subscribe(response => {
      this.savedJobsCount = (response?.list || []).length;
    });

    this.subscribers.myJobAlertsSub = this.jobAlertService.myList().subscribe(response => {
      this.jobAlertsCount = (response?.list || []).length;
    });
  }
}
