import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class BannerService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public listBanners(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_BANNER, paramsMap);
  }

  public createBanner(body: any): Observable<any> {
    return super.post(API_URLS.CREATE_BANNER, body);
  }

  public updateBanner(body: any): Observable<any> {
    return super.put(API_URLS.UPDATE_BANNER, body);
  }

  public deleteBanner(id: number): Observable<any> {
    return super.deleteById(API_URLS.DELETE_BANNER, { id });
  }

  public activeBanner(): Observable<any> {
    return super.get(API_URLS.ACTIVE_BANNER);
  }
}
