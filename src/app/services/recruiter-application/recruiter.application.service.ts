import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class RecruiterApplicationService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public submit(body: any): Observable<any> {
    return super.post(API_URLS.SUBMIT_RECRUITER_APPLICATION, body);
  }

  public searchApplications(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_RECRUITER_APPLICATION, paramsMap);
  }

  public findById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_RECRUITER_APPLICATION_BY_ID, { id });
    return super.get(url);
  }

  public approve(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.APPROVE_RECRUITER_APPLICATION, { id });
    return super.put(url, {});
  }

  public reject(id: number, note: string): Observable<any> {
    const url = this.createUrl(API_URLS.REJECT_RECRUITER_APPLICATION, { id });
    return super.put(url, { note });
  }
}
