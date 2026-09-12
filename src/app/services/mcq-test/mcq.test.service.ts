import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class McqTestService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public searchTests(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_MCQ_TEST, paramsMap);
  }

  public createTest(body: any): Observable<any> {
    return super.post(API_URLS.CREATE_MCQ_TEST, body);
  }

  public updateTest(body: any): Observable<any> {
    return super.put(API_URLS.UPDATE_MCQ_TEST, body);
  }

  public findTestById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_MCQ_TEST_BY_ID, { id });
    return super.get(url);
  }

  public removeTest(id: number): Observable<any> {
    return this.removeById(API_URLS.REMOVE_MCQ_TEST, { id });
  }
}
