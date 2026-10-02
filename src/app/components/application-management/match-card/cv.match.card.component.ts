import { Component, Input, OnChanges } from '@angular/core';
import { BaseComponent } from '../../base.component';
import { ApplicationService } from '../../../services/application/application.service';
import { CvMatch } from '../../../services/application/domain/application.domain';

@Component({
  selector: 'app-cv-match-card',
  templateUrl: './cv.match.card.component.html',
  styleUrls: ['./cv.match.card.component.scss']
})
export class CvMatchCardComponent extends BaseComponent implements OnChanges {
  @Input() applicationId!: number;

  match: CvMatch | null = null;

  constructor(private applicationService: ApplicationService) {
    super();
  }

  ngOnChanges(): void {
    if (!this.applicationId) { return; }
    this.loading = true;
    this.subscribers.matchSub = this.applicationService.fetchMatch(this.applicationId).subscribe({
      next: (response) => { this.match = response?.obj || null; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
