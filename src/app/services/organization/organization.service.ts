import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public searchOrganizations(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_ORGANIZATION, paramsMap);
  }

  public createOrganization(body: any): Observable<any> {
    return super.post(API_URLS.CREATE_ORGANIZATION, body);
  }

  public updateOrganization(body: any): Observable<any> {
    return super.put(API_URLS.UPDATE_ORGANIZATION, body);
  }

  public findOrganizationById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_ORGANIZATION_BY_ID, { id });
    return super.get(url);
  }

  public deleteOrganization(id: number): Observable<any> {
    return this.removeById(API_URLS.REMOVE_ORGANIZATION, { id });
  }
}
