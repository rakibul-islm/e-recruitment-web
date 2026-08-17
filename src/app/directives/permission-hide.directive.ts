import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { PermissionService } from '../services/permission/permission.service';

@Directive({
  selector: '[appPermissionHide]'
})
export class PermissionHideDirective implements OnInit, OnDestroy {
  @Input('appPermissionHide') routeName!: string;

  private subscription?: Subscription;
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.subscription = this.permissionService.grantedRouteNames$.subscribe(() => this.updateView());
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateView(): void {
    const granted = this.permissionService.hasRoutePermission(this.routeName);

    if (granted && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
      return;
    }

    if (!granted && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
