import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class CompanyTypeService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public list(): Observable<any> {
    return super.get(API_URLS.FILTER_COMPANY_TYPE, new Map().set('isPageable', false));
  }

  public create(name: string): Observable<any> {
    return super.post(API_URLS.CREATE_COMPANY_TYPE, { name });
  }
}
