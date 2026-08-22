import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PermissionService } from '../../permission/permission.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard {
  constructor(private permissionService: PermissionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const routeName = route.data?.['routeName'] as string | undefined;

    return this.permissionService.ensureGrantedRouteNamesLoaded().pipe(
      map(() => this.permissionService.hasRoutePermission(routeName)
        ? true
        : this.router.createUrlTree(['/access-denied']))
    );
  }
}
