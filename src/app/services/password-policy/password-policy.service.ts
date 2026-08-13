import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class PasswordPolicyService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public getPasswordPolicy(): Observable<any> {
    return super.get(API_URLS.FIND_PASSWORD_POLICY);
  }

  public updatePasswordPolicy(body: any): Observable<any> {
    return super.put(API_URLS.UPDATE_PASSWORD_POLICY, body);
  }
}
