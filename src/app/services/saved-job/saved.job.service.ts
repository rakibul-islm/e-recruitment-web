import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class SavedJobService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public toggle(jobCircularId: number): Observable<any> {
    const url = this.createUrl(API_URLS.TOGGLE_SAVED_JOB, { jobCircularId });
    return super.post(url, {});
  }

  public myList(): Observable<any> {
    return super.get(API_URLS.MY_SAVED_JOBS);
  }
}
