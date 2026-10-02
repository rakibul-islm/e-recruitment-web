import { Component, Input } from '@angular/core';
import { ProfileCompleteness, ProfileCompletenessSection } from '../../../../services/candidate-profile/domain/candidate.profile.domain';

@Component({
  selector: 'app-profile-completeness',
  templateUrl: './profile.completeness.component.html',
  styleUrls: ['./profile.completeness.component.scss']
})
export class ProfileCompletenessComponent {
  @Input() completeness?: ProfileCompleteness | null;

  detailsVisible = false;

  get missingSections(): ProfileCompletenessSection[] {
    return (this.completeness?.sections || []).filter(section => section.earned < section.weight);
  }
}
