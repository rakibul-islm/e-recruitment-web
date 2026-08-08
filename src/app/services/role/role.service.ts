import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public searchRoles(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_ROLE, paramsMap);
  }

  public createRole(body: any): Observable<any> {
    return super.post(API_URLS.CREATE_ROLE, body);
  }

  public updateRole(body: any): Observable<any> {
    return super.put(API_URLS.UPDATE_ROLE, body);
  }

  public findRoleById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_ROLE_BY_ID, { id });
    return super.get(url);
  }

  public deleteRole(id: number): Observable<any> {
    return this.deleteById(API_URLS.DELETE_ROLE, { id });
  }
}
