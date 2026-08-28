import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements AfterViewInit, OnDestroy {
  @Input() title: string = '';
  menuOpen = false;
  hasActions = false;

  @ViewChild('menuTrigger') menuTrigger?: ElementRef;
  @ViewChild('actionsPanel') actionsPanel!: ElementRef;

  private observer?: MutationObserver;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.updateHasActions();
    this.observer = new MutationObserver(() => this.updateHasActions());
    this.observer.observe(this.actionsPanel.nativeElement, { childList: true, subtree: true });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private updateHasActions(): void {
    const hasActions = this.actionsPanel.nativeElement.children.length > 0;
    if (hasActions !== this.hasActions) {
      this.hasActions = hasActions;
      this.cdr.detectChanges();
    }
  }

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
    if (this.menuTrigger?.nativeElement.contains(target) || this.actionsPanel.nativeElement.contains(target)) {
      return;
    }
    this.menuOpen = false;
  }
}
