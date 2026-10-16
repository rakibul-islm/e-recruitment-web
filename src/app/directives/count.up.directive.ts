import { Directive, ElementRef, Input, NgZone, OnChanges, OnDestroy } from '@angular/core';

const DURATION_MS = 700;

@Directive({
  selector: '[appCountUp]'
})
export class CountUpDirective implements OnChanges, OnDestroy {
  @Input('appCountUp') value: number | null | undefined = 0;

  private current = 0;
  private frame = 0;

  constructor(private host: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngOnChanges(): void {
    const target = Number(this.value) || 0;
    cancelAnimationFrame(this.frame);

    if (target === this.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.render(target);
      return;
    }

    const from = this.current;
    const start = performance.now();
    this.zone.runOutsideAngular(() => {
      const tick = (now: number) => {
        const progress = Math.min((now - start) / DURATION_MS, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        this.render(from + (target - from) * eased);
        if (progress < 1) {
          this.frame = requestAnimationFrame(tick);
        }
      };
      this.frame = requestAnimationFrame(tick);
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frame);
  }

  private render(value: number): void {
    this.current = value;
    this.host.nativeElement.textContent = String(Math.round(value));
  }
}
