import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class CompanyService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public searchCompanies(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_COMPANY, paramsMap);
  }

  public createCompany(body: any): Observable<any> {
    return super.post(API_URLS.CREATE_COMPANY, body);
  }

  public updateCompany(body: any): Observable<any> {
    return super.put(API_URLS.UPDATE_COMPANY, body);
  }

  public findCompanyById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_COMPANY_BY_ID, { id });
    return super.get(url);
  }

  public deleteCompany(id: number): Observable<any> {
    return this.removeById(API_URLS.REMOVE_COMPANY, { id });
  }
}
