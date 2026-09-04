import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class JobAlertService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public save(body: any): Observable<any> {
    return super.post(API_URLS.SAVE_JOB_ALERT, body);
  }

  public myList(): Observable<any> {
    return super.get(API_URLS.MY_JOB_ALERTS);
  }

  public remove(id: number): Observable<any> {
    return this.removeById(API_URLS.REMOVE_JOB_ALERT, { id });
  }
}
