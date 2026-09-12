import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class McqTestAssignmentService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public assign(body: any): Observable<any> {
    return super.post(API_URLS.ASSIGN_MCQ_TEST, body);
  }

  public bulkAssign(body: any): Observable<any> {
    return super.post(API_URLS.BULK_ASSIGN_MCQ_TEST, body);
  }

  public myAssignments(): Observable<any> {
    return super.get(API_URLS.MY_MCQ_TEST_ASSIGNMENTS);
  }

  public findByApplication(applicationId: number): Observable<any> {
    const url = this.createUrl(API_URLS.MCQ_ASSIGNMENTS_BY_APPLICATION, { applicationId });
    return super.get(url);
  }

  public findById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_MCQ_ASSIGNMENT_BY_ID, { id });
    return super.get(url);
  }

  public getQuestions(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.MCQ_ASSIGNMENT_QUESTIONS, { id });
    return super.get(url);
  }

  public start(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.START_MCQ_ASSIGNMENT, { id });
    return super.post(url, {});
  }

  public advance(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.ADVANCE_MCQ_ASSIGNMENT, { id });
    return super.post(url, {});
  }

  public saveAnswer(id: number, body: any): Observable<any> {
    const url = this.createUrl(API_URLS.ANSWER_MCQ_ASSIGNMENT, { id });
    return super.put(url, body);
  }

  public submit(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.SUBMIT_MCQ_ASSIGNMENT, { id });
    return super.post(url, {});
  }
}
