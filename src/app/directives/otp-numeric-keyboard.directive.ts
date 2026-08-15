import { AfterViewInit, Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: 'p-inputOtp'
})
export class OtpNumericKeyboardDirective implements AfterViewInit {
  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    const inputs = this.el.nativeElement.querySelectorAll('input');
    inputs.forEach(input => this.renderer.setAttribute(input, 'inputmode', 'numeric'));
  }
}
