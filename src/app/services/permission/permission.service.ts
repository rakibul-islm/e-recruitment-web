import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';
import { AuthService } from '../utility/security/auth.service';
import { Permission } from './domain/permission.domain';

@Injectable({
  providedIn: 'root'
})
export class PermissionService extends BaseService {
  private grantedRouteNamesSubject = new BehaviorSubject<Set<string>>(new Set<string>());
  private loaded = false;

  constructor(http: HttpClient, private authService: AuthService) {
    super(http);
  }

  public searchPermissions(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_PERMISSION, paramsMap);
  }

  get grantedRouteNames$(): Observable<Set<string>> {
    return this.grantedRouteNamesSubject.asObservable();
  }

  public fetchGrantedRouteNames(): void {
    this.loadGrantedRouteNames().subscribe();
  }

  public clearGrantedRouteNames(): void {
    this.loaded = false;
    this.grantedRouteNamesSubject.next(new Set<string>());
  }

  // PermissionGuard needs this: reading grantedRouteNamesSubject.value directly would race the
  // header's initial fetch on app bootstrap, wrongly denying access before permissions arrive.
  public ensureGrantedRouteNamesLoaded(): Observable<Set<string>> {
    return this.loaded ? of(this.grantedRouteNamesSubject.value) : this.loadGrantedRouteNames();
  }

  private loadGrantedRouteNames(): Observable<Set<string>> {
    return this.searchPermissions(new Map().set('isPageable', false)).pipe(
      map(response => this.resolveGrantedRouteNames(response?.list || [])),
      tap(names => {
        this.loaded = true;
        this.grantedRouteNamesSubject.next(names);
      })
    );
  }

  public hasRoutePermission(routeName?: string): boolean {
    return !routeName || this.grantedRouteNamesSubject.value.has(routeName);
  }

  private resolveGrantedRouteNames(permissions: Permission[]): Set<string> {
    return new Set(
      permissions
        .filter(permission => permission.routeName && this.authService.hasAuthority(permission.authority))
        .map(permission => permission.routeName)
    );
  }

  public createPermission(body: any): Observable<any> {
    return super.post(API_URLS.CREATE_PERMISSION, body);
  }

  public updatePermission(body: any): Observable<any> {
    return super.put(API_URLS.UPDATE_PERMISSION, body);
  }

  public findPermissionById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_PERMISSION_BY_ID, { id });
    return super.get(url);
  }

  public deletePermission(id: number): Observable<any> {
    return this.removeById(API_URLS.REMOVE_PERMISSION, { id });
  }
}
