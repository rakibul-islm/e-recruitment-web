import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { Observable } from 'rxjs';
import { API_URLS } from '../utility/constants/api.urls';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {

  constructor(
    http: HttpClient) {
    super(http);
  }

  public fetchProfileData(urlSearchParams: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FETCH_PROFILE, urlSearchParams);
  }

  public updateProfile(body: any): Observable<any> {
    return super.put(API_URLS.UPDATE_PROFILE, body);
  }

  public requestChangePasswordOtp(body: { oldPassword: string }): Observable<any> {
    return super.post(API_URLS.REQUEST_CHANGE_PASSWORD_OTP, body);
  }

  public verifyChangePasswordOtp(body: { otp: string }): Observable<any> {
    return super.post(API_URLS.VERIFY_CHANGE_PASSWORD_OTP, body);
  }

  public changePassword(body: any): Observable<any> {
    return super.put(API_URLS.CHANGE_PASSWORD, body);
  }

  public createRegisterUser(body: any): Observable<any> {
    return super.post(API_URLS.CREATE_REGISTER_USER, body);
  }

  public verifySignupOtp(body: { email: string; otp: string }): Observable<any> {
    return super.post(API_URLS.VERIFY_SIGNUP_OTP, body);
  }

  public resendSignupOtp(email: string): Observable<any> {
    return super.post(API_URLS.RESEND_SIGNUP_OTP, { email });
  }

  public findUserById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_USER_BY_ID, { id });
    return super.get(url);
  }

  public updateUser(body: any): Observable<any> {
    return super.put(API_URLS.UPDATE_USER, body);
  }

  public searchUsers(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_USER, paramsMap);
  }

  public createUser(body: any): Observable<any> {
    return super.post(API_URLS.CREATE_USER, body);
  }

  public deleteUser(id: number): Observable<any> {
    return this.deleteById(API_URLS.DELETE_USER, { id });
  }
}
