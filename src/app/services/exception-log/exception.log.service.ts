import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class ExceptionLogService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public searchExceptionLogs(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_EXCEPTION_LOG, paramsMap);
  }

  public findExceptionLogById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_EXCEPTION_LOG_BY_ID, { id });
    return super.get(url);
  }

  public deleteExceptionLog(id: number): Observable<any> {
    return this.removeById(API_URLS.REMOVE_EXCEPTION_LOG, { id });
  }
}
