import { Directive, ElementRef, Input, OnDestroy, OnInit, Optional, Renderer2, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PermissionService } from '../services/permission/permission.service';

@Directive({
  selector: '[appPermissionDisable]'
})
export class PermissionDisableDirective implements OnInit, OnDestroy {
  @Input('appPermissionDisable') routeName!: string;

  private subscription?: Subscription;

  constructor(
    @Optional() @Self() private ngControl: NgControl,
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.subscription = this.permissionService.grantedRouteNames$.subscribe(() => this.updateDisabledState());
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateDisabledState(): void {
    const disabled = !this.permissionService.hasRoutePermission(this.routeName);

    if (this.ngControl?.control) {
      disabled ? this.ngControl.control.disable() : this.ngControl.control.enable();
      return;
    }

    if (disabled) {
      this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
      return;
    }

    this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
  }
}
