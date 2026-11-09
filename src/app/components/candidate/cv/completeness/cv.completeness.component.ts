import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CvCompleteness, CvCompletenessSection } from '../../../../services/candidate-cv/domain/candidate.cv.domain';

const EDIT_PATH = '/my/cv/edit';

@Component({
  selector: 'app-cv-completeness',
  templateUrl: './cv.completeness.component.html',
  styleUrls: ['./cv.completeness.component.scss']
})
export class CvCompletenessComponent {
  @Input() completeness?: CvCompleteness | null;

  detailsVisible = false;

  constructor(private router: Router) {}

  get missingSections(): CvCompletenessSection[] {
    return (this.completeness?.sections || []).filter(section => section.earned < section.weight);
  }

  goToSection(key: string): void {
    this.detailsVisible = false;

    if (this.router.url.split('?')[0] === EDIT_PATH) {
      setTimeout(() => CvCompletenessComponent.scrollToSection(key));
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
