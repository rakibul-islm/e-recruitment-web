import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';
import { BACKGROUND_REQUEST } from '../utility/interceptors/http.context.tokens';

@Injectable({
  providedIn: 'root'
})
export class BackupService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public listBackups(): Observable<any> {
    return super.get(API_URLS.LIST_BACKUP);
  }

  public createBackup(): Observable<any> {
    return super.post(API_URLS.CREATE_BACKUP, {});
  }

  public uploadBackup(file: File): Observable<any> {
    const body = new FormData();
    body.append('file', file);
    return super.post(API_URLS.UPLOAD_BACKUP, body);
  }

  public uploadToDrive(id: number): Observable<any> {
    return super.post(this.createUrl(API_URLS.DRIVE_UPLOAD_BACKUP, { id }), {});
  }

  public downloadBackup(id: number): Observable<Blob> {
    return super.getBlob(this.createUrl(API_URLS.DOWNLOAD_BACKUP, { id }));
  }

  public deleteBackup(id: number): Observable<any> {
    return this.removeById(API_URLS.DELETE_BACKUP, { id });
  }

  public restoreBackup(id: number, confirmation: string): Observable<any> {
    return super.post(this.createUrl(API_URLS.RESTORE_BACKUP, { id }), { confirmation });
  }

  public restoreStatus(): Observable<any> {
    return super.get(API_URLS.RESTORE_STATUS, undefined, new HttpContext().set(BACKGROUND_REQUEST, true));
  }
}
