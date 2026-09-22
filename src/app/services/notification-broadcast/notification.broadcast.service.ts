import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class NotificationBroadcastService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public listRoles(): Observable<any> {
    return super.get(API_URLS.NOTIFICATION_BROADCAST_ROLES);
  }

  public searchUsers(keyword: string): Observable<any> {
    return super.get(API_URLS.NOTIFICATION_BROADCAST_USERS, new Map().set('keyword', keyword));
  }

  public send(body: any): Observable<any> {
    return super.post(API_URLS.SEND_NOTIFICATION_BROADCAST, body);
  }
}
