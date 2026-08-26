import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class ArchiveConfigService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public searchArchiveConfigs(paramsMap: Map<any, any>): Observable<any> {
    return super.get(API_URLS.FILTER_ARCHIVE_CONFIG, paramsMap);
  }

  public createArchiveConfig(body: any): Observable<any> {
    return super.post(API_URLS.CREATE_ARCHIVE_CONFIG, body);
  }

  public updateArchiveConfig(body: any): Observable<any> {
    return super.put(API_URLS.UPDATE_ARCHIVE_CONFIG, body);
  }

  public findArchiveConfigById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_ARCHIVE_CONFIG_BY_ID, { id });
    return super.get(url);
  }

  public deleteArchiveConfig(id: number): Observable<any> {
    return this.removeById(API_URLS.REMOVE_ARCHIVE_CONFIG, { id });
  }

  public listSourceTables(): Observable<any> {
    return super.get(API_URLS.LIST_ARCHIVE_CONFIG_SOURCE_TABLES);
  }

  public listArchiveSchemas(): Observable<any> {
    return super.get(API_URLS.LIST_ARCHIVE_CONFIG_SCHEMAS);
  }

  public listDateColumns(sourceTable: string): Observable<any> {
    return super.get(API_URLS.LIST_ARCHIVE_CONFIG_DATE_COLUMNS, new Map<any, any>().set('sourceTable', sourceTable));
  }

  public archiveNow(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.ARCHIVE_CONFIG_ARCHIVE_NOW, { id });
    return super.post(url, {});
  }

  public findArchivedData(id: number, page: number, size: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_ARCHIVE_CONFIG_ARCHIVED_DATA, { id });
    return super.get(url, new Map<any, any>().set('page', page).set('size', size));
  }
}
