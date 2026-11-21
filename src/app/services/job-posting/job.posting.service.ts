import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';
import { JobListState } from './domain/job.posting.domain';

@Injectable({
  providedIn: 'root'
})
export class JobPostingService extends BaseService {
  private listState: JobListState | null = null;

  constructor(http: HttpClient) {
    super(http);
  }

  // Lets the public job list restore itself (cards, page, filters) when the user comes back from a job.
  public saveListState(state: JobListState): void {
    this.listState = state;
  }

  public getListState(): JobListState | null {
    return this.listState;
  }

  public searchJobPostings(paramsMap: Map<any, any>): Observable<any> {
    return this.searchPage(API_URLS.FILTER_JOB_POSTING, paramsMap);
  }

  public createJobPosting(body: any): Observable<any> {
    return super.post(API_URLS.CREATE_JOB_POSTING, body);
  }

  public updateJobPosting(body: any): Observable<any> {
    return super.put(API_URLS.UPDATE_JOB_POSTING, body);
  }

  public findJobPostingByUuid(uuid: string): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_JOB_POSTING_BY_UUID, { uuid });
    return super.get(url);
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
