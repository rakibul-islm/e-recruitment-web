import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public searchAuditLogs(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_AUDIT_LOG, paramsMap);
  }

  public findAuditLogById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_AUDIT_LOG_BY_ID, { id });
    return super.get(url);
  }
}
