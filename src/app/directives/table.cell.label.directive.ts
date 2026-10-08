import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy } from '@angular/core';

@Directive({
  selector: 'p-table'
})
export class TableCellLabelDirective implements AfterViewInit, OnDestroy {
  private observer?: MutationObserver;
  private scheduled = false;

  constructor(private host: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.observer = new MutationObserver(() => this.schedule());
      this.observer.observe(this.host.nativeElement, { childList: true, subtree: true, characterData: true });
      this.schedule();
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private schedule(): void {
    if (this.scheduled) {
      return;
    }
    this.scheduled = true;
    requestAnimationFrame(() => {
      this.scheduled = false;
      this.applyLabels();
    });
  }

  private applyLabels(): void {
    const root = this.host.nativeElement;
    const headers = Array.from(root.querySelectorAll('thead.p-datatable-thead > tr:last-child > th'));
    const labels = headers.map(th => (th.textContent ?? '').trim());
    root.querySelectorAll('tbody.p-datatable-tbody > tr').forEach(row => {
      Array.from(row.children).forEach((cell, index) => {
        if (!(cell instanceof HTMLElement) || cell.hasAttribute('colspan')) {
          return;
        }
        const label = labels[index] ?? '';
        if (cell.getAttribute('data-label') !== label) {
          cell.setAttribute('data-label', label);
        }
      });
    });
  }
}
