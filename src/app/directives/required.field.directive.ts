import { AfterViewInit, Directive, ElementRef, Optional, Renderer2, Self } from '@angular/core';
import { NgControl, Validators } from '@angular/forms';

@Directive({
  selector: '[formControlName], [formControl]'
})
export class RequiredFieldDirective implements AfterViewInit {
  constructor(
    @Optional() @Self() private ngControl: NgControl,
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    const control = this.ngControl?.control;
    if (!control) { return; }

    const isRequired = control.hasValidator(Validators.required) || control.hasValidator(Validators.requiredTrue);
    if (!isRequired) { return; }

    const label = this.findAssociatedLabel();
    if (label && !label.querySelector('.required-marker')) {
      const marker = this.renderer.createElement('span');
      this.renderer.addClass(marker, 'required-marker');
      this.renderer.addClass(marker, 'p-error');
      this.renderer.setProperty(marker, 'textContent', ' *');
      this.renderer.appendChild(label, marker);
    }
  }

  private findAssociatedLabel(): HTMLLabelElement | null {
    const hostEl = this.el.nativeElement;
    const scope: ParentNode = hostEl.closest('form') ?? document;
    if (hostEl.id) {
      const byFor = scope.querySelector(`label[for="${hostEl.id}"]`);
      if (byFor) { return byFor as HTMLLabelElement; }
    }
    return hostEl.parentElement?.querySelector('label') ?? null;
  }
}
