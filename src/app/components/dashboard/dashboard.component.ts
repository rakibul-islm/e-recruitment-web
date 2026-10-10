import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TableLazyLoadEvent } from 'primeng/table';
import { BaseComponent } from '../base.component';
import { AuthService } from '../../services/utility/security/auth.service';
import { PermissionService } from '../../services/permission/permission.service';
import { Profile } from '../../services/user/domain/user.domain';
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { RecruitmentSummary } from '../../services/analytics/domain/analytics.domain';
import { ApplicationService } from '../../services/application/application.service';
import { CandidateDashboardSummary, RecentApplication } from '../../services/application/domain/application.domain';
import { OfferService } from '../../services/offer/offer.service';
import { SavedJobService } from '../../services/saved-job/saved.job.service';
import { JobAlertService } from '../../services/job-alert/job.alert.service';
import { McqTestAssignmentService } from '../../services/mcq-test-assignment/mcq.test.assignment.service';
import { McqTestAssignment } from '../../services/mcq-test-assignment/domain/mcq.test.assignment.domain';

const CANDIDATE_ACTIVE_STATUSES = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER'];
const CANDIDATE_DETAIL_HEADERS: { [mode: string]: string } = {
  myApplications: 'dashboard.totalApplications',
  myActive: 'dashboard.activeApplications',
  myOffers: 'dashboard.offersToRespond',
  mySavedJobs: 'menu.savedJobs',
  myJobAlerts: 'menu.jobAlerts'
};

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
  recentApplications: RecentApplication[] = [];
  totalApplicationsCount = 0;
  activeApplicationsCount = 0;
  offersToRespondCount = 0;
  savedJobsCount = 0;
  jobAlertsCount = 0;
  pendingExams: McqTestAssignment[] = [];

  // Detail dialog
  detailVisible = false;
  detailMode = '';
  detailLoading = false;
  detailRows: any[] = [];
  candidateRows: any[] = [];
  detailTotal = 0;

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private analyticsService: AnalyticsService,
    private applicationService: ApplicationService,
    private offerService: OfferService,
    private savedJobService: SavedJobService,
    private jobAlertService: JobAlertService,
    private mcqTestAssignmentService: McqTestAssignmentService,
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
    this.subscribers.mySummarySub = this.applicationService.mySummary().subscribe({
      next: (response) => {
        const summary: CandidateDashboardSummary = response?.obj || new CandidateDashboardSummary();
        this.totalApplicationsCount = summary.totalApplications;
        this.activeApplicationsCount = summary.activeApplications;
        this.offersToRespondCount = summary.offersToRespond;
        this.savedJobsCount = summary.savedJobs;
        this.jobAlertsCount = summary.jobAlerts;
        this.recentApplications = summary.recentApplications || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.subscribers.myMcqAssignmentsSub = this.mcqTestAssignmentService.myAssignments().subscribe(response => {
      const assignments: McqTestAssignment[] = response?.list || [];
      const today = new Date().toDateString();
      this.pendingExams = assignments.filter(a =>
        (a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS') && (!a.scheduledAt || new Date(a.scheduledAt).toDateString() === today)
      );
    });
  }

  goToApplication(applicationId: number): void {
    this.router.navigate(['/my/applications', applicationId]);
  }

  get isCandidateDetail(): boolean {
    return this.detailMode.startsWith('my');
  }

  get detailHeader(): string {
    return this.isCandidateDetail ? CANDIDATE_DETAIL_HEADERS[this.detailMode] : 'analyticsPage.detail.' + this.detailMode;
  }

  openCandidateDetail(mode: string): void {
    this.detailMode = mode;
    this.candidateRows = [];
    this.detailLoading = true;
    this.detailVisible = true;

    this.subscribers.candidateDetailSub = this.candidateDetailRequest(mode).subscribe({
      next: (response) => {
        const rows: any[] = response?.list || [];
        this.candidateRows = mode === 'myActive' ? rows.filter(a => CANDIDATE_ACTIVE_STATUSES.includes(a.status))
          : mode === 'myOffers' ? rows.filter(o => o.status === 'SENT') : rows;
        this.detailLoading = false;
      },
      error: () => { this.detailLoading = false; }
    });
  }

  private candidateDetailRequest(mode: string): Observable<any> {
    switch (mode) {
      case 'myOffers': return this.offerService.myOffers();
      case 'mySavedJobs': return this.savedJobService.myList();
      case 'myJobAlerts': return this.jobAlertService.myList();
      default: return this.applicationService.fetchMyApplications();
    }
  }

  goToJob(jobCircularId: number): void {
    this.router.navigate(['/jobs', jobCircularId]);
  }

  openDetail(mode: string): void {
    this.detailMode = mode;
    this.detailRows = [];
    this.detailTotal = 0;
    this.detailLoading = true;
    this.detailVisible = true;
  }

  fetchDetail(event: TableLazyLoadEvent): void {
    if (!this.detailMode) return;

    const size = event.rows || this.rows;
    this.detailLoading = true;

    this.subscribers.detailSub = this.analyticsService.details(this.detailMode, Math.floor((event.first || 0) / size), size).subscribe({
      next: (response) => {
        this.detailRows = response?.page?.content || [];
        this.detailTotal = response?.page?.totalElements || 0;
        this.detailLoading = false;
      },
      error: () => { this.detailLoading = false; }
    });
  }
}
