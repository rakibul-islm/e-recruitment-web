import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class InterviewService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public schedule(body: any): Observable<any> {
    return super.post(API_URLS.SCHEDULE_INTERVIEW, body);
  }

  public searchInterviews(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_INTERVIEWS, paramsMap);
  }

  public findInterviewById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_INTERVIEW_BY_ID, { id });
    return super.get(url);
  }

  public findByApplication(applicationId: number): Observable<any> {
    const url = this.createUrl(API_URLS.INTERVIEWS_BY_APPLICATION, { applicationId });
    return super.get(url);
  }

  public changeStatus(id: number, status: string): Observable<any> {
    const url = this.createUrl(API_URLS.CHANGE_INTERVIEW_STATUS, { id });
    return super.put(url, { status });
  }

  public submitFeedback(id: number, body: any): Observable<any> {
    const url = this.createUrl(API_URLS.SUBMIT_INTERVIEW_FEEDBACK, { id });
    return super.post(url, body);
  }
}
