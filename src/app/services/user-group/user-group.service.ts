import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class UserGroupService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public searchUserGroups(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_USER_GROUP, paramsMap);
  }

  public createUserGroup(body: any): Observable<any> {
    return super.post(API_URLS.CREATE_USER_GROUP, body);
  }

  public updateUserGroup(body: any): Observable<any> {
    return super.put(API_URLS.UPDATE_USER_GROUP, body);
  }

  public findUserGroupById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_USER_GROUP_BY_ID, { id });
    return super.get(url);
  }

  public deleteUserGroup(id: number): Observable<any> {
    return this.deleteById(API_URLS.DELETE_USER_GROUP, { id });
  }
}
