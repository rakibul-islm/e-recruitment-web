import { Component, Input, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService } from '../../../services/base.service';

@Component({
  selector: 'app-page-navigation',
  templateUrl: './page.navigation.component.html'
})
export class PageNavigationComponent {
  @Input() service!: BaseService;
  @Input() previousLabel = 'common.previous';
  @Input() nextLabel = 'common.next';

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private get recordId(): string {
    const params = this.route.snapshot.paramMap;
    return params.get('uuid') ?? params.get('id') ?? '';
  }

  get canNavigate(): boolean {
    return this.service.isNavigable(this.recordId);
  }

  get hasPrevious(): boolean {
    return this.service.hasPrevious(this.recordId);
  }

  get hasNext(): boolean {
    return this.service.hasNext(this.recordId);
  }

  goToPrevious(): void {
    this.service.previousId(this.recordId).subscribe(id => this.open(id));
  }

  goToNext(): void {
    this.service.nextId(this.recordId).subscribe(id => this.open(id));
  }

  private open(id: string | null): void {
    if (!id) { return; }
    const path = this.router.url.split('?')[0];
    this.router.navigate([path.substring(0, path.lastIndexOf('/')), id], { replaceUrl: true });
  }
}
