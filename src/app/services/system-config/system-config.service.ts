import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class SystemConfigService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public searchSystemConfigs(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_SYSTEM_CONFIG, paramsMap);
  }

  public updateSystemConfig(body: any): Observable<any> {
    return super.put(API_URLS.UPDATE_SYSTEM_CONFIG, body);
  }

  public findSystemConfigById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_SYSTEM_CONFIG_BY_ID, { id });
    return super.get(url);
  }
}
