import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base.component';
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { RecruitmentSummary, ApplicationFunnel } from '../../services/analytics/domain/analytics.domain';

@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics.dashboard.component.html'
})
export class AnalyticsDashboardComponent extends BaseComponent implements OnInit {
  summary: RecruitmentSummary = new RecruitmentSummary();
  funnel: ApplicationFunnel = new ApplicationFunnel();
  statusEntries: { status: string; count: number }[] = [];
  funnelEntries: { status: string; count: number }[] = [];

  constructor(private analyticsService: AnalyticsService) {
    super();
  }

  ngOnInit(): void {
    this.fetchSummary();
    this.fetchFunnel();
  }

  fetchSummary(): void {
    this.loading = true;
    this.subscribers.summarySub = this.analyticsService.summary().subscribe({
      next: (response) => {
        this.summary = response?.obj || new RecruitmentSummary();
        this.statusEntries = Object.entries(this.summary.applicationsByStatus || {}).map(([status, count]) => ({ status, count: count as number }));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  fetchFunnel(): void {
    this.subscribers.funnelSub = this.analyticsService.funnel().subscribe(response => {
      this.funnel = response?.obj || new ApplicationFunnel();
      this.funnelEntries = Object.entries(this.funnel.statusCounts || {}).map(([status, count]) => ({ status, count: count as number }));
    });
  }
}
