import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public apply(body: any): Observable<any> {
    return super.post(API_URLS.APPLY_TO_JOB, body);
  }

  public fetchMyApplications(): Observable<any> {
    return super.get(API_URLS.MY_APPLICATIONS);
  }

  public searchApplications(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_APPLICATIONS, paramsMap);
  }

  public findApplicationById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_APPLICATION_BY_ID, { id });
    return super.get(url);
  }

  public changeStatus(id: number, body: any): Observable<any> {
    const url = this.createUrl(API_URLS.CHANGE_APPLICATION_STATUS, { id });
    return super.put(url, body);
  }

  public fetchHistory(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.APPLICATION_HISTORY, { id });
    return super.get(url);
  }

  public downloadCv(applicationId: number): Observable<Blob> {
    const url = this.createUrl(API_URLS.DOWNLOAD_APPLICATION_CV, { id: applicationId });
    return super.getBlob(url);
  }
}
