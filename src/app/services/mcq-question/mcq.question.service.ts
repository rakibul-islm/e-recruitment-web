import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class McqQuestionService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public searchQuestions(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_MCQ_QUESTION, paramsMap);
  }

  public createQuestion(body: any): Observable<any> {
    return super.post(API_URLS.CREATE_MCQ_QUESTION, body);
  }

  public updateQuestion(body: any): Observable<any> {
    return super.put(API_URLS.UPDATE_MCQ_QUESTION, body);
  }

  public findQuestionById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_MCQ_QUESTION_BY_ID, { id });
    return super.get(url);
  }

  public removeQuestion(id: number): Observable<any> {
    return this.removeById(API_URLS.REMOVE_MCQ_QUESTION, { id });
  }

  public generate(body: any): Observable<any> {
    return super.post(API_URLS.GENERATE_MCQ_QUESTIONS, body);
  }
}
