import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { SavedJobService } from '../../../services/saved-job/saved.job.service';
import { SavedJob } from '../../../services/saved-job/domain/saved.job.domain';

@Component({
  selector: 'app-candidate-saved-jobs',
  templateUrl: './candidate.saved.jobs.component.html'
})
export class CandidateSavedJobsComponent extends BaseComponent implements OnInit {
  savedJobs: SavedJob[] = [];

  constructor(private savedJobService: SavedJobService, private router: Router) {
    super();
  }

  ngOnInit(): void {
    this.fetchSavedJobs();
  }

  fetchSavedJobs(): void {
    this.loading = true;
    this.subscribers.mySavedJobsSub = this.savedJobService.myList().subscribe({
      next: (response) => {
        this.savedJobs = response?.list || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  unsave(savedJob: SavedJob): void {
    this.subscribers.unsaveSub = this.savedJobService.toggle(savedJob.jobCircularId).subscribe(() => {
      this.notificationService.sendSuccessMsg('savedJob.removeSuccess');
      this.fetchSavedJobs();
    });
  }

  viewJob(savedJob: SavedJob): void {
    this.router.navigate(['/jobs', savedJob.jobCircularId]);
  }
}
