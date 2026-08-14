import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class PermissionService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public searchPermissions(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_PERMISSION, paramsMap);
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
