import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { finalize, map, shareReplay, tap } from 'rxjs/operators';
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
  private inFlightLoad: Observable<Set<string>> | null = null;

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
    this.inFlightLoad = null;
    this.grantedRouteNamesSubject.next(new Set<string>());
  }

  // PermissionGuard needs this: reading grantedRouteNamesSubject.value directly would race the
  // header's initial fetch on app bootstrap, wrongly denying access before permissions arrive.
  public ensureGrantedRouteNamesLoaded(): Observable<Set<string>> {
    return this.loaded ? of(this.grantedRouteNamesSubject.value) : this.loadGrantedRouteNames();
  }

  // The route guard, header and dashboard all ask at bootstrap, before the first response lands; sharing the
  // in-flight request means one fetch instead of one per caller.
  private loadGrantedRouteNames(): Observable<Set<string>> {
    if (!this.inFlightLoad) {
      this.inFlightLoad = this.searchPermissions(new Map().set('isPageable', false)).pipe(
        map(response => this.resolveGrantedRouteNames(response?.list || [])),
        tap(names => {
          this.loaded = true;
          this.grantedRouteNamesSubject.next(names);
        }),
        finalize(() => { this.inFlightLoad = null; }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.inFlightLoad;
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
