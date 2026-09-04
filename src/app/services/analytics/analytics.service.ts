import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public summary(): Observable<any> {
    return super.get(API_URLS.ANALYTICS_SUMMARY);
  }

  public funnel(jobCircularId?: number): Observable<any> {
    const params = jobCircularId ? new Map<any, any>().set('jobCircularId', jobCircularId) : undefined;
    return super.get(API_URLS.ANALYTICS_FUNNEL, params);
  }
}
