import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  @Input() title: string = '';
  menuOpen = false;

  @ViewChild('menuTrigger') menuTrigger!: ElementRef;
  @ViewChild('actionsPanel') actionsPanel!: ElementRef;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.menuOpen) {
      return;
    }
    const target = event.target as Node;
    if (this.menuTrigger.nativeElement.contains(target) || this.actionsPanel.nativeElement.contains(target)) {
      return;
    }
    this.menuOpen = false;
  }
}
