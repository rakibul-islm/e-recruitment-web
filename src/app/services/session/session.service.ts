import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class SessionService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public searchSessions(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_SESSION, paramsMap);
  }

  public getSummary(): Observable<any> {
    return super.get(API_URLS.SESSION_SUMMARY);
  }

  public findSessionById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_SESSION_BY_ID, { id });
    return super.get(url);
  }

  public findSessionsByUser(userId: number): Observable<any> {
    const url = this.createUrl(API_URLS.SESSIONS_BY_USER, { userId });
    return super.get(url);
  }

  public forceLogoutSession(id: number): Observable<any> {
    return this.removeById(API_URLS.REMOVE_SESSION, { id });
  }

  public forceLogoutAll(): Observable<any> {
    return this.removeById(API_URLS.FORCE_LOGOUT_ALL, {});
  }
}
