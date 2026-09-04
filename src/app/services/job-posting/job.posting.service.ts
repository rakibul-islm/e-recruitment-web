import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class JobPostingService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public searchJobPostings(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_JOB_POSTING, paramsMap);
  }

  public createJobPosting(body: any): Observable<any> {
    return super.post(API_URLS.CREATE_JOB_POSTING, body);
  }

  public updateJobPosting(body: any): Observable<any> {
    return super.put(API_URLS.UPDATE_JOB_POSTING, body);
  }

  public findJobPostingById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_JOB_POSTING_BY_ID, { id });
    return super.get(url);
  }

  public deleteJobPosting(id: number): Observable<any> {
    return this.removeById(API_URLS.REMOVE_JOB_POSTING, { id });
  }

  public aiSuggest(body: any): Observable<any> {
    return super.post(API_URLS.AI_SUGGEST_JOB_POSTING, body);
  }
}
