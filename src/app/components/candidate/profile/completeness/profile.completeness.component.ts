import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileCompleteness, ProfileCompletenessSection } from '../../../../services/candidate-profile/domain/candidate.profile.domain';

const EDIT_PATH = '/my/profile/edit';

@Component({
  selector: 'app-profile-completeness',
  templateUrl: './profile.completeness.component.html',
  styleUrls: ['./profile.completeness.component.scss']
})
export class ProfileCompletenessComponent {
  @Input() completeness?: ProfileCompleteness | null;

  detailsVisible = false;

  constructor(private router: Router) {}

  get missingSections(): ProfileCompletenessSection[] {
    return (this.completeness?.sections || []).filter(section => section.earned < section.weight);
  }

  goToSection(key: string): void {
    this.detailsVisible = false;

    if (this.router.url.split('?')[0] === EDIT_PATH) {
      setTimeout(() => ProfileCompletenessComponent.scrollToSection(key));
    } else {
      this.router.navigate([EDIT_PATH], { queryParams: { section: key } });
    }
  }

  static scrollToSection(key: string): void {
    const isLinks = key === 'links';
    const target = document.getElementById(isLinks ? 'profileLinkedin' : 'cv-section-' + key);
    if (!target) {
      return;
    }
    target.scrollIntoView({ behavior: 'smooth', block: isLinks ? 'center' : 'start' });
    if (isLinks) {
      target.focus({ preventScroll: true });
    }
  }
}
