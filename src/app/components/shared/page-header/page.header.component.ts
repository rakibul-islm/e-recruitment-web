import { Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  templateUrl: './page.header.component.html',
  styleUrls: ['./page.header.component.scss']
})
export class PageHeaderComponent {
  @Input() title: string = '';

  hidden = false;
  private lastScrollY = 0;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const currentY = window.scrollY || document.documentElement.scrollTop || 0;
    if (window.innerWidth > 768) {
      this.hidden = false;
    } else if (currentY <= 0 || currentY < this.lastScrollY) {
      this.hidden = false;
    } else if (currentY > this.lastScrollY + 4) {
      this.hidden = true;
    }
    this.lastScrollY = currentY;
  }
}
