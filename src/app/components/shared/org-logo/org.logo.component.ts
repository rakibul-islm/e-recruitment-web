import { Component, Input, OnChanges } from '@angular/core';
import { organizationLogoUrl } from '../../../services/utility/logo.util';

/** Renders the org logo, falling back to a branded monogram tile of the org's initial. */
@Component({
  selector: 'app-org-logo',
  template: `
    <img *ngIf="src" [src]="src" [alt]="name || 'logo'" [attr.loading]="lazy ? 'lazy' : null" (error)="failed = true" />
    <span class="org-logo-fallback" *ngIf="!src"><span class="org-logo-initial">{{ initial }}</span></span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
    }

    /* Any logo shape renders undistorted. */
    img {
      height: 100%;
      width: auto;
      max-width: 100%;
      object-fit: contain;
      display: block;
    }

    .org-logo-fallback {
      height: 100%;
      aspect-ratio: 1 / 1;
      border-radius: 28%;
      background: linear-gradient(135deg, #1e4d8f 0%, #4f83e0 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      container-type: inline-size;
    }

    .org-logo-initial {
      font-size: 42cqw;
      font-weight: 700;
      line-height: 1;
      user-select: none;
    }
  `]
})
export class OrgLogoComponent implements OnChanges {
  @Input() fileId?: number | null;
  @Input() name?: string | null;
  /** Takes precedence over fileId (e.g. local preview). */
  @Input() srcOverride?: string | null;
  @Input() lazy = true;

  failed = false;

  ngOnChanges(): void {
    this.failed = false;
  }

  get src(): string | null {
    if (this.failed) { return null; }
    return this.srcOverride ?? organizationLogoUrl(this.fileId);
  }

  get initial(): string {
    const trimmed = (this.name || '').trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
  }
}
