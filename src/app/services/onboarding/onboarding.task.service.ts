import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class OnboardingTaskService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public addTask(body: any): Observable<any> {
    return super.post(API_URLS.ADD_ONBOARDING_TASK, body);
  }

  public findByApplication(applicationId: number): Observable<any> {
    const url = this.createUrl(API_URLS.ONBOARDING_TASKS_BY_APPLICATION, { applicationId });
    return super.get(url);
  }

  public complete(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.COMPLETE_ONBOARDING_TASK, { id });
    return super.put(url, {});
  }

  public remove(id: number): Observable<any> {
    return this.removeById(API_URLS.REMOVE_ONBOARDING_TASK, { id });
  }
}
